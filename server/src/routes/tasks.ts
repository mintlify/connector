import { Router } from 'express';
import { Types } from 'mongoose';
import Doc from '../models/Doc';
import Task from '../models/Task';
import { userMiddleware } from './user';

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

  await Task.create({
    org: org._id,
    doc: new Types.ObjectId(docId),
    status: 'todo',
    type: 'update',
    url: doc.url,
  })
  return res.end();
});

tasksRouter.delete('/:taskId', userMiddleware, async (req, res) => {
  const { taskId } = req.params;

  await Task.findByIdAndUpdate(taskId, { status: 'done' });
  return res.end();
})

export default tasksRouter;