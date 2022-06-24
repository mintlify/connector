import { Router } from 'express';
import Doc from '../models/Doc';
import Task, { TaskType } from '../models/Task';
import { userMiddleware, removeUnneededDataFromOrg } from './user';
import { Alert, AlertStatus } from '../helpers/github/types';
import { track } from '../services/segment';
import Org from '../models/Org';

const tasksRouter = Router();

tasksRouter.get('/', userMiddleware, async (_, res) => {
  const { org } = res.locals.user;

  const tasks = await Task.aggregate([
    {
      $match: {
        org: org._id,
        status: 'todo'
      }
    },
    {
      $lookup: {
        from: 'docs',
        localField: 'doc',
        foreignField: '_id',
        as: 'doc'
      }
    },
    {
      $set: {
        doc: { $first: "$doc" },
      },
    }
  ]);
  res.send({ tasks });
});

tasksRouter.post('/update/:docId', userMiddleware, async (req, res) => {
  const { docId } = req.params;
  const { org } = res.locals.user;

  const doc = await Doc.findById(docId);

  if (doc == null) {
    return res.status(400).send({error: 'No doc with DocId found'});
  }

  const task = await Task.create({
    org: org._id,
    doc: docId,
    status: 'todo',
    type: 'update',
    url: doc.url,
  });

  track(res.locals.user.userId, 'Task Created', {
    id: task._id.toString(),
    org: org._id.toString(),
    doc: docId,
    type: 'update'
  })
  
  return res.send({ task });
});

tasksRouter.delete('/:taskId', userMiddleware, async (req, res) => {
  const { taskId } = req.params;

  await Task.findByIdAndUpdate(taskId, { status: 'done' });
  track(res.locals.user.userId, 'Task Completed', {
    id: taskId,
    org: res.locals.user.org._id
  });
  return res.end();
})

tasksRouter.post('/github', async (req, res) => {
  const { alerts } : { alerts: Alert[] }= req.body;
  if (alerts == null || alerts.length === 0) return res.status(200);
  const { org } = alerts[0].code;
  const tasks = alerts.map((alert) => {
    const { code } = alert
    const task: TaskType = {
      org,
      doc: code.doc,
      code: code._id,
      status: 'todo',
      type: 'review',
      source: 'github',
      url: alert.url,
      githubCommentId: alert?.githubCommentId
    };
    return task;
  });
  const tasksResponse = await Task.insertMany(tasks);
  const trackPromises = tasksResponse.map((task:any) => {
    return track(org.toString(), 'Task Created', {...task, isOrg: true});
  });
  await Promise.all(trackPromises);

  return res.status(200);
});

tasksRouter.post('/github/update', async (req, res) => {
  const { alertStatus, gitOrg }: { alertStatus: AlertStatus, gitOrg: string, repo: string } = req.body;
  const status = alertStatus.isResolved ? 'done' : 'todo';
  const task: any = await Task.findOneAndUpdate(
    {
      githubCommentId: alertStatus.id,
      source: 'github',
      type: 'review'
    },
    {
      status
    }
  );
  if (task != null && task.status !== status && status === 'done') { // task is resolved
    try {
      // FindOne might cause an issue with separate installations on the same org
      const org = await Org.findOne({'integrations.github.installations': {
        $elemMatch: {
            'account.login': gitOrg
        }
      }});
      const formattedOrg = removeUnneededDataFromOrg(org);
      track(formattedOrg._id, 'Task Completed', {...task, isOrg: true});
    } catch (error) {
      return res.status(200);
    }
    
  }
  return res.status(200);
});

export default tasksRouter;