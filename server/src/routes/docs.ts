import axios from 'axios';
import express from 'express';
import { Types } from 'mongoose';
import { userMiddleware } from './user';
import Doc, { DocType } from '../models/Doc';
import Event from '../models/Event';
import { ContentData, ScrapingMethod } from '../services/webscraper';
import { deleteDocForSearch } from '../services/algolia';
import { createDocsFromConfluencePages, createDocsFromGoogleDocs } from '../helpers/routes/docs';
import Org from '../models/Org';
import { getNotionPageDataWithId } from '../services/notion';
import { getConfluenceContentFromPageById } from './integrations/confluence';
import { getGoogleDocsPrivateData } from '../services/googleDocs';

const docsRouter = express.Router();

export const extractFromDoc = async (doc: DocType, orgId: string): Promise<ContentData | null> => {
  if (doc.method === 'notion-private' && doc.notion?.pageId) {
    const org = await Org.findById(orgId);
    const notionAccessToken = org?.integrations?.notion?.access_token;
    if (notionAccessToken == null) {
      throw 'Unable to get organization by ID for Notion'
    }
    return getNotionPageDataWithId(doc.notion.pageId, notionAccessToken);
  }

  else if (doc.method === 'googledocs-private' && doc.googledocs?.id) {
    const org = await Org.findById(orgId);
    const googleCredentials = org?.integrations?.google;
    if (googleCredentials == null) {
      throw 'Unable to get organization by ID for Google Docs'
    }
    return getGoogleDocsPrivateData(doc.googledocs.id, googleCredentials);
  }

  else if (doc.method === 'confluence-private' && doc.confluence?.id) {
    const org = await Org.findById(orgId);
    const confluenceCredentials = org?.integrations?.confluence;
    if (confluenceCredentials == null) {
      throw 'Unable to get organization by ID for Confluence'
    }
    return getConfluenceContentFromPageById(doc.confluence.id, confluenceCredentials);
  }

  return null;
}

docsRouter.get('/', userMiddleware, async (req, res) => {
  const org = res.locals.user.org;
  const { shouldShowCreatedBySelf } = req.query;

  const matchQuery: { org: Types.ObjectId, createdBy?: Types.ObjectId } = { org: org._id };
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

const groupNameMap: Record<ScrapingMethod, string> = {
  'notion-private': 'Notion Workspace',
  'confluence-private': 'Confluence Pages',
  'googledocs-private': 'Google Docs',
  'github': 'GitHub READMEs',
  'web': 'Web Pages',
}

docsRouter.get('/groups', userMiddleware, async (_, res) => {
  const { org } = res.locals.user;
  const groups = await Doc.aggregate([
    { $match: {
      org: org._id
    }
    },
    {
      $group: {
        _id: "$method",
        count: { $sum: 1 },
        lastUpdatedAt: { $max: "$lastUpdatedAt" }
      },
    },
    {
      $sort: { lastUpdatedAt: -1 }
    }
  ]);

  const groupsWithNames = groups.map((group: { _id: ScrapingMethod }) => {
    return {
      ...group,
      name: groupNameMap[group._id],
    }
  })

  return res.send({ groups: groupsWithNames })
})

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
    const deleteDocPromise = Doc.findOneAndDelete({ _id: docId, org: org._id });
    const deleteEventsPromise = Event.deleteMany({ doc: docId });
    const deleteDocForSearchPromise = deleteDocForSearch(docId);

    await Promise.all([deleteDocPromise, deleteEventsPromise, deleteDocForSearchPromise]);
    res.end();
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
    const docData = await extractFromDoc(doc, orgId);
    if (docData == null) {
      return res.status(400).send('Invalid doc')
    }

    const { content, title, favicon, method } = docData;
    return res.send({ content, title, favicon, method });
  } catch (error) {
    console.log(error);
    return res.status(500).send({error: 'Internal systems error'});
  }
})

export default docsRouter;
