import express from 'express';
import Event from '../models/Event';

const eventsRouter = express.Router();

eventsRouter.get('/', async (req, res) => {
    const { org, doc } = req.query;
    if (!org) {
      res.send({ error: 'No org specified', events: [] });
    }

    const query: { org: string, doc?: string } = { org } as { org: string };
    
    if (doc) {
      query.doc = doc as string;
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
      }
    ]);

    return res.send({ events });
});

export default eventsRouter;