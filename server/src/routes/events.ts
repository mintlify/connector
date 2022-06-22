import express from 'express';
import mongoose, { Types } from 'mongoose';
import Event, { EventType, EventTypeMeta } from '../models/Event';
import { userMiddleware } from './user';
import * as Diff from 'diff';
import { Alert } from '../helpers/github/types';
import { track } from '../services/segment';

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
      event.change = data as Diff.Change[];
      break;
    default:
      return;
  }

  return Event.create(event);
}

eventsRouter.get('/', userMiddleware, async (req, res) => {
  try {
    const { doc } = req.query;
    const org = res.locals.user.org;

    const query: any = { org: org._id };
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

eventsRouter.post('/alerts', async (req, res) => {
  const { alerts, org } = req.body;
  const events: EventType[] = [];
  alerts.forEach((alert: Alert) => {
    if (alert?.code == null) return;
    const event: EventType = {
      org: org._id,
      doc: alert.code.doc,
      type: 'code',
      code: {
        id: alert.code._id,
        isAddressed: false 
      }
    }
    events.push(event);
  })
  await Event.insertMany(events);
  track(org._id.toString(), 'GitHub alert triggered', {
    isOrg: true,
    numberOfEvents: events.length,
  })
  return res.status(200);
})
export default eventsRouter;