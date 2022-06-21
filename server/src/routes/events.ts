import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event';
import { userMiddleware } from './user';

const eventsRouter = express.Router();

eventsRouter.get('/', userMiddleware, async (req, res) => {
  try {
    const { doc } = req.query;
    const org = res.locals.user.org;

    const query: { org: string, doc?: mongoose.Types.ObjectId } = { org: org._id };
    if (doc) {
      query.doc = new mongoose.Types.ObjectId(doc as string)
    }

    const events = await Event.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'docs',
          localField: 'doc',
          foreignField: '_id',
          as: 'doc',
        }
      },
      {
        $set: {
          doc: { $first: "$doc" }
        }
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]);

    const eventsWithNoDocsFilteredOut = events.filter((event) => {
      return event.doc != null
    })

    return res.send({ events: eventsWithNoDocsFilteredOut });
  } catch {
    return res.send({events: []});
  }
});

export default eventsRouter;