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
import { NotionPage } from './integrations/notion';

const docsRouter = express.Router();

// userId is the _id of the user not `userId`
export const createDocFromUrl = async (url: string, orgId: string, userId: Types.ObjectId) => {
  const response = await axios.get(url);
  const { content, method, title, favicon } = await extractDataFromHTML(url, response.data);
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
      isJustAdded: true,
    },
    {
      upsert: true,
      new: true,
    }
  );

  return { content, doc, method };
};

export const createDocsFromNotionPageId = async (pages: NotionPage[], orgId: Types.ObjectId, userId: string) => {
  const addDocPromises = pages.map((page) => new Promise<void>(async (resolve) => {
    try {
      // Add doc without content
      const doc = await Doc.findOneAndUpdate(
        {
          org: orgId,
          url: page.url,
        },
        {
          org: orgId,
          url: page.url,
          method: 'notion-private',
          notion: {
            pageId: page.id,
          },
          content: '', // to be scraped
          title: `${page.icon?.emoji ? `${page.icon?.emoji} ` : ''}${page.title}`,
          favicon: page.icon?.file,
          createdBy: userId,
          isJustAdded: true,
          lastUpdatedAt: Date.parse(page.lastEditedTime)
        },
        {
          upsert: true,
          new: true,
        }
      );

      await createEvent(orgId, doc._id, 'add', {});
      indexDocForSearch(doc);
      track(userId, 'Add documentation', {
        doc: doc._id.toString(),
        method: 'notion-private',
        org: orgId.toString(),
      });

      resolve();
    }
    catch {
      resolve();
    }
  }));

  await Promise.all(addDocPromises);
}

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

export default docsRouter;
