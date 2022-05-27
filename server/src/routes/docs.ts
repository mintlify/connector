import axios from 'axios';
import express from 'express';
import { Types } from 'mongoose';
import { userMiddleware } from './user';
import { createEvent } from './events';
import Doc from '../models/Doc';
import Event from '../models/Event';
import { getDataFromWebpage } from '../services/webscraper';
import { deleteDocForSearch, indexDocForSearch } from '../services/algolia';
import { track } from '../services/segment';

const docsRouter = express.Router();

// userId is the _id of the user not `userId`
export const createDocFromUrl = async (url: string, orgId: string, userId: Types.ObjectId) => {
  const { content, method, title, favicon } = await getDataFromWebpage(url, orgId);
  let foundFavicon = favicon;
  if (!foundFavicon) {
    try {
      const faviconRes = await axios.get(`https://s2.googleusercontent.com/s2/favicons?sz=128&domain_url=${url}`);
      foundFavicon = faviconRes.request.res.responseUrl;
    } catch {
      foundFavicon = undefined;
    }
  }
  const doc = await Doc.findOneAndUpdate(
    {
      org: orgId,
      url,
    },
    {
      org: orgId,
      url,
      method,
      content,
      title,
      favicon,
      createdBy: userId,
    },
    {
      upsert: true,
      new: true,
    }
  );

  return { content, doc, method };
};

docsRouter.get('/', userMiddleware, async (_, res) => {
  const org = res.locals.user.org;
  try {
    const docs = await Doc.aggregate([
      {
        $match: { org },
      },
      {
        $sort: { lastUpdatedAt: -1 },
      },
      {
        $lookup: {
          from: 'code',
          foreignField: 'doc',
          localField: '_id',
          as: 'code',
        },
      },
      {
        $lookup: {
          from: 'automations',
          foreignField: 'source.doc',
          localField: '_id',
          as: 'automations',
        },
      },
    ]);
    return res.status(200).send({ docs });
  } catch (error) {
    return res.status(500).send({ error, docs: [] });
  }
});

docsRouter.post('/', userMiddleware, async (req, res) => {
  const { url } = req.body;
  const org = res.locals.user.org;
  try {
    console.log('Starting to create doc from url');
    const { content, doc, method } = await createDocFromUrl(url, org, res.locals.user._id);
    console.log('Successfully created doc from url');
    if (doc != null) {
      console.log('Start creating an event');
      await createEvent(org, doc._id, 'add', {});
      console.log('Successfully creating an event');
      console.log('Start indexing doc for search');
      indexDocForSearch(doc);
      console.log('Succesfully indexing doc for search');

      console.log('Start tracking doc');
      track(res.locals.user.userId, 'Add documentation', {
        doc: doc._id.toString(),
        method,
        org: org.toString(),
      });
      console.log('Successfuly tracking doc');
    } else console.log('Doc is null');
    res.send({ content });
  } catch (error) {
    console.log({error});
    res.status(500).send({ error });
  }
});

docsRouter.delete('/:docId', userMiddleware, async (req, res) => {
  const { docId } = req.params;
  const { org } = res.locals.user;

  try {
    const deleteDocPromise = Doc.findOneAndDelete({ _id: docId, org });
    const deleteEventsPromise = Event.deleteMany({ doc: docId });
    const deleteDocForSearchPromise = deleteDocForSearch(docId);

    await Promise.all([deleteDocPromise, deleteEventsPromise, deleteDocForSearchPromise]);
    res.end();
  } catch (error) {
    res.status(500).send({ error });
  }
});

docsRouter.post('/content', async (req, res) => {
  const { url, orgId } = req.body;

  try {
    const page = await getDataFromWebpage(url, orgId);
    res.send({page});
  } catch (error) {
    res.status(500).send({ error });
  }
})

export default docsRouter;
