import axios from 'axios';
import express from 'express';
import { userMiddleware } from './user';
import Doc, { DocType } from '../models/Doc';
import Event from '../models/Event';
import { ContentData, ScrapingMethod } from '../services/webscraper';
import { deleteDocForSearch, indexDocsForSearch } from '../services/algolia';
import Org from '../models/Org';
import { getNotionPageDataWithId } from '../services/notion';
import { getConfluenceContentFromPageById } from './integrations/confluence';
import { getGoogleDocsPrivateData } from '../services/googleDocs';
import * as cheerio from 'cheerio';

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

export const getDataFromUrl = async (urlInput: string) => {
  let urlWithProtocol = urlInput;
  if (!urlWithProtocol.startsWith('https://')) {
    urlWithProtocol = `https://${urlWithProtocol}`;
  }

  const { data: html } = await axios.get(urlWithProtocol);
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim();
  let favicon = $('link[rel="shortcut icon"]').attr('href') || $('link[rel="icon"]').attr('href');
  if (favicon?.startsWith('//')) {
    favicon = `https:${favicon}`;
  } else if (favicon?.startsWith('/')) {
    const urlParsed = new URL(urlWithProtocol);
    favicon = `${urlParsed.origin}${favicon}`;
  }
  if (!favicon) {
    try {
      const faviconRes = await axios.get(`https://s2.googleusercontent.com/s2/favicons?sz=128&domain_url=${urlWithProtocol}`);
      favicon = faviconRes.request.res.responseUrl;
    } catch {
      favicon = undefined;
    }
  }

  return {title, favicon, urlWithProtocol};
}

docsRouter.get('/preview', async (req, res) => {
  let url = req.query.url as string;
  if (!url) {
    return res.end();
  }

  try {
    const { title, favicon } = await getDataFromUrl(url);
    return res.send({title, favicon});
  } catch {
    return res.status(400).send({error: 'Unable to fetch content from URL'});
  }
});

docsRouter.get('/', userMiddleware, async (req, res) => {
  const org = res.locals.user.org;
  const { shouldShowCreatedBySelf } = req.query;

  const matchQuery: any = { org: org._id };
  if (shouldShowCreatedBySelf) {
    matchQuery.createdBy = res.locals.user.userId;
  }

  try {
    const docs = await Doc.aggregate([
      {
        $match: matchQuery,
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
          from: "tasks",
          let: { doc: "$_id" },
          pipeline: [
             { $match:
                { $expr:
                   { $and:
                      [
                        { $eq: [ "$doc",  "$$doc" ] },
                        { $eq: [ "$status", "todo" ] }
                      ]
                   }
                }
             },
          ],
          as: "tasks"
        },
      },
      {
        $set: {
          tasksCount: { $size: "$tasks" },
          codesCount: { $size: "$code" }
        }
      },
      {
        $sort: { tasksCount: -1, codesCount: -1, lastUpdatedAt: -1 },
      },
    ]);
    return res.status(200).send({ docs });
  } catch (error) {
    return res.status(500).send({ error, docs: [] });
  }
});

const groupMap: Record<ScrapingMethod, { name: string, importStatusId: string, id:  ScrapingMethod }> = {
  'notion-private': { name: 'Notion', importStatusId: 'notion', id: 'notion-private' },
  'confluence-private': { name: 'Confluence', importStatusId: 'confluence', id: 'confluence-private' },
  'googledocs-private': { name: 'Google Docs', importStatusId: 'googledocs', id: 'googledocs-private' },
  'github': { name: 'GitHub', importStatusId: 'github', id: 'github' },
  'web': { name: 'Web Pages', importStatusId: '', id: 'web' },
}

docsRouter.get('/groups', userMiddleware, async (_, res) => {
  const { org } = res.locals.user;
  const groups = await Doc.aggregate([
    { $match: {
      org: org._id
    },
    },
    {
      $sort: { lastUpdatedAt: -1 }
    },
    {
      $lookup: {
        from: "tasks",
        let: { doc: "$_id" },
        pipeline: [
           { $match:
              { $expr:
                 { $and:
                    [
                      { $eq: [ "$doc",  "$$doc" ] },
                      { $eq: [ "$status", "todo" ] }
                    ]
                 }
              }
           },
        ],
        as: "tasks"
      },
    },
    {
      $set: {
        tasksCount: { $size: '$tasks' }
      }
    },
    {
      $group: {
        _id: "$method",
        count: { $sum: 1 },
        tasksCount: { $sum: '$tasksCount' },
        lastUpdatedDoc: { $first: "$$ROOT" }
      },
    },
    {
      $sort: { 'lastUpdatedDoc.lastUpdatedAt': -1 }
    },
  ]);

  const groupsWithNames: any[] = [];
  
  groups.forEach((group: { _id: ScrapingMethod }) => {
    const groupData = groupMap[group._id];
    if (groupData == null) {
      return;
    }

    groupsWithNames.push({
      ...group,
      name: groupData.name,
      isLoading: Boolean(org.importStatus[groupData.importStatusId])
    })
  });

  // Add currently importing apps to display
  Object.entries(org.importStatus).forEach(([importingApp, isImporting]) => {
    const isAlreadyInList = groupsWithNames.some((group: { _id: ScrapingMethod }) => groupMap[group._id]?.importStatusId === importingApp);
    if (isImporting && !isAlreadyInList) {
      const group = Object.values(groupMap).find((groupData) => {
        return groupData.importStatusId === importingApp;
      })
      groupsWithNames.unshift({
        _id: group?.id,
        name: group?.name || '',
        isLoading: true,
      })
    }
  });

  return res.send({ groups: groupsWithNames })
});

docsRouter.post('/webpage', userMiddleware, async (req, res) => {
  const { org, userId } = res.locals.user;
  const { url } = req.body;

  try {
    const { title, favicon, urlWithProtocol } = await getDataFromUrl(url);
    const doc = await Doc.findOneAndUpdate({
      org: org._id,
      url: urlWithProtocol,
    }, {
      org: org._id,
      url: urlWithProtocol,
      method: 'web',
      favicon,
      title,
      isJustAdded: true,
      createdBy: userId
    }, { upsert: true, new: true });
    indexDocsForSearch([doc]);
    res.send({doc})
  } catch (error) {
    res.status(500).send({error});
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
