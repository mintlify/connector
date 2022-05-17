import express from 'express';
import mongoose, { Types } from 'mongoose';
import Event, { EventType, EventTypeMeta } from '../models/Event';
import { userMiddleware } from './user';

const eventsRouter = express.Router();

export const createEvent = (org: Types.ObjectId, doc: Types.ObjectId, type: EventTypeMeta, data: Object) => {
  const event: EventType = {
    org,
    doc,
    type,
  };

  switch (type) {
    case 'add':
      event.add = data;
      break;
    case 'change':
      event.change = data;
      break;
    default:
      return;
  }

  return Event.create(event);
}

eventsRouter.get('/', userMiddleware, async (req, res) => {
    const { doc } = req.query;
    const org = res.locals.user.org;

    const query: { org: string, doc?: mongoose.Types.ObjectId } = { org } as { org: string };
    
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
});

export default eventsRouter;