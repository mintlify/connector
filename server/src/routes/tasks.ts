import { Router } from 'express';
import { Types } from 'mongoose';
import Doc from '../models/Doc';
import Task, { TaskType } from '../models/Task';
import { userMiddleware } from './user';
import { Alert, AlertStatus } from '../helpers/github/types';

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
    doc: new Types.ObjectId(docId),
    status: 'todo',
    type: 'update',
    url: doc.url,
  });
  
  return res.send({ task });
});

tasksRouter.delete('/:taskId', userMiddleware, async (req, res) => {
  const { taskId } = req.params;

  await Task.findByIdAndUpdate(taskId, { status: 'done' });
  return res.end();
})

tasksRouter.post('/github', async (req, res) => {
  const { alerts } : { alerts: Alert[], url: string }= req.body;
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
  await Task.insertMany(tasks);
  return res.status(200);
});

tasksRouter.post('/github/update', async (req, res) => {
  const {alertStatus}: { alertStatus: AlertStatus } = req.body;
  const status = alertStatus.isResolved ? 'done' : 'todo';
  await Task.findOneAndUpdate(
    {
      githubCommentId: alertStatus.id,
      source: 'github',
      type: 'review'
    },
    {
      status
    },
    {
      new: true
    }
  );
  return res.status(200);
});

export default tasksRouter;