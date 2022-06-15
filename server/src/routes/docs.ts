import axios from 'axios';
import express from 'express';
import { Types } from 'mongoose';
import { userMiddleware } from './user';
import { createEvent } from './events';
import Doc from '../models/Doc';
import Event from '../models/Event';
import { extractDataFromHTML, getDataFromWebpage } from '../services/webscraper';
import { deleteDocForSearch, indexDocForSearch } from '../services/algolia';
import { track } from '../services/segment';
import { createDocFromUrl, createDocsFromConfluencePages, createDocsFromGoogleDocs, createDocsFromNotionPageId } from '../helpers/routes/docs';
import { extractFromDoc } from './scan';

const docsRouter = express.Router();

docsRouter.get('/', userMiddleware, async (req, res) => {
  const org = res.locals.user.org;
  const { shouldShowCreatedBySelf } = req.query;

  const matchQuery: { org: Types.ObjectId, createdBy?: Types.ObjectId } = { org };
  if (shouldShowCreatedBySelf) {
    matchQuery.createdBy = res.locals.user._id;
  }

  try {
    const docs = await Doc.aggregate([
      {
        $match: matchQuery,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: 'code',
          foreignField: 'doc',
          localField: '_id',
          as: 'code',
        },
      }
    ]);
    return res.status(200).send({ docs });
  } catch (error) {
    return res.status(500).send({ error, docs: [] });
  }
});

docsRouter.get('/preview', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    return res.end();
  }

  try {
    const response = await axios.get(url);
    const { title, favicon } = await extractDataFromHTML(url, response.data);
    return res.send({title, favicon});
  } catch {
    return res.status(400).send({error: 'Unable to fetch content from URL'});
  }
});

docsRouter.post('/', userMiddleware, async (req, res) => {
  const { url } = req.body;
  const org = res.locals.user.org;
  try {
    // Initial add is using light mode scan
    const { content, doc, method } = await createDocFromUrl(url, org, res.locals.user._id);
    if (doc == null) {
      return res.status(400).send({error: 'No doc available'});
    }
    await createEvent(org, doc._id, 'add', {});
    indexDocForSearch(doc);
    track(res.locals.user.userId, 'Add documentation', {
      doc: doc._id.toString(),
      method,
      org: org.toString(),
    });
    return res.send({ content });
  } catch (error) {
    return res.status(500).send({ error });
  }
});

docsRouter.post('/notion', userMiddleware, async (req, res) => {
  const { pages } = req.body;
  const org = res.locals.user.org;

  try {
    // Initial add is using light mode scan
    await createDocsFromNotionPageId(pages, org, res.locals.user._id);
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

docsRouter.post('/googledocs', userMiddleware, async (req, res) => {
  const { docs } = req.body;
  const org = res.locals.user.org;

  try {
    // Initial add is using light mode scan
    await createDocsFromGoogleDocs(docs, org, res.locals.user._id);
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

docsRouter.post('/confluence', userMiddleware, async (req, res) => {
  const { pages } = req.body;
  const org = res.locals.user.org;

  try {
    await createDocsFromConfluencePages(pages, org, res.locals.user._id);
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
})

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
    const page = await getDataFromWebpage(url, orgId, 6000);
    res.send({ page });
  } catch (error) {
    res.status(500).send({ error });
  }
});

docsRouter.put('/:docId/slack', async (req, res) => {
  try {
    const { docId } = req.params;
    const { slack } = req.body;
    const doc = await Doc.findById(docId);
    if (doc == null) return res.status(400).json({ error: 'Invalid doc ID' });
    await Doc.findByIdAndUpdate(docId, { slack });
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

docsRouter.put('/:docId/email', async (req, res) => {
  try {
    const { docId } = req.params;
    const { email } = req.body;
    const doc = await Doc.findById(docId);
    if (doc == null) return res.status(400).json({ error: 'Invalid doc ID' });
    await Doc.findByIdAndUpdate(doc._id, { email }, {new: true, strict: false});
    return res.end();
  } catch (error) {
    return res.status(500).send({ error });
  }
});

docsRouter.get('/screen', async (req, res) => {
  try {
    const url = req.query.url as string;
    const { data } = await axios.get(url);
    res.send(data);
  } catch {
    res.status(400).end();
  }
});

docsRouter.get('/content/:id', userMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await Doc.findById(id);
    if (doc == null) {
      return res.status(400).send('No doc available');
    }

    const orgId = doc.org;
    const { content, title, favicon, method } = await extractFromDoc(doc, orgId);
    return res.send({ content, title, favicon, method });
  } catch (error) {
    console.log(error);
    return res.status(500).send({error: 'Internal systems error'});
  }
})

export default docsRouter;
