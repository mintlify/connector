import express from 'express';
import * as Diff from 'diff';
import Doc, { DocType } from '../models/Doc';
import Event, { EventType } from '../models/Event';
import { ContentData, getDataFromWebpage } from '../services/webscraper';
import { triggerAutomationsForEvents } from '../automations';
import { updateDocContentForSearch } from '../services/algolia';
import { workQueue } from '../workers';
import mongoose from 'mongoose';
import Org from '../models/Org';
import { track } from '../services/segment';
import { getNotionPageDataWithId } from '../services/notion';

const scanRouter = express.Router();

type DiffAndContent = {
  diff: Diff.Change[],
  newContent: string,
  newTitle: string,
  newMethod: string,
  newFavicon?: string,
}

interface DiffAlert extends DiffAndContent {
  doc: DocType
}

type DocUpdateStatus = 'just-added' | 'first-change' | 'continuous-change' | 'event-trigger';

const DIFF_CONFIRMATION_THRESHOLD = 2;
const WAIT_FOR_WEB_SCRAPE = 6000; // in ms

// Currently supports webpage and notion page
const extractFromDoc = async (doc: DocType, orgId: string): Promise<ContentData> => {
  if (doc.method === 'notion-private' && doc.notion?.pageId) {
    const org = await Org.findById(orgId);
    const notionAccessToken = org?.integrations?.notion?.access_token;
    if (notionAccessToken == null) {
      throw 'Unable to get organization by ID'
    }
    return getNotionPageDataWithId(doc.notion.pageId, notionAccessToken);
  }

  return getDataFromWebpage(doc.url, orgId, WAIT_FOR_WEB_SCRAPE);
}

const getDiffAndContent = async (doc: DocType, orgId: string): Promise<DiffAndContent> => {
  const previousContent = doc.content || '';
  const { content, title, favicon, method } = await extractFromDoc(doc, orgId);
  return {
    diff: Diff.diffWords(previousContent, content),
    newContent: content,
    newTitle: title,
    newFavicon: favicon,
    newMethod: method,
  }
}

const getDocUpdateStatus = (doc: DocType): DocUpdateStatus => {
  if (doc.isJustAdded) {
    return 'just-added';
  } else if (doc.changeConfirmationCount == null) {
    return 'first-change'
  } else if (doc.changeConfirmationCount < DIFF_CONFIRMATION_THRESHOLD) {
    return 'continuous-change'
  }
  return 'event-trigger';
}

export const scanDocsInOrg = async (orgId: string) => {
  const docsFromOrg = await Doc.find({ org: orgId });
  const getDifferencePromises = docsFromOrg.map((doc) => {
    return getDiffAndContent(doc, orgId);
  });

  const diffsAndContentResults = await Promise.all(getDifferencePromises);

  const diffAlerts: DiffAlert[] = [];
  const sameContentDocs: DocType[] = [];
  diffsAndContentResults.forEach((diffsAndContent, i) => {
    const { diff } = diffsAndContent;
    const hasChanges = diff.some((diff) => (diff.added || diff.removed) && diff.value.trim());
    const doc = docsFromOrg[i];
    if (hasChanges || doc.isJustAdded) {
      diffAlerts.push({
        ...diffsAndContent,
        doc,
      });
    } else {
      sameContentDocs.push(doc);
    }
  });

  const newContentUpdateQueries = diffAlerts.map(({ doc, newContent, newTitle, newFavicon }) => {
    const updateStatus = getDocUpdateStatus(doc);
    switch (updateStatus) {
      case 'just-added':
        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { isJustAdded: false, content: newContent, title: newTitle, favicon: newFavicon }
          }
        }
      case 'first-change':
        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { changeConfirmationCount: 1 }
          }
        }
      case 'continuous-change':
        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { changeConfirmationCount: doc.changeConfirmationCount! + 1 }
          }
        }
      default:
        return {
          updateOne: {
            filter: { _id: doc._id },
            update: { content: newContent, changeConfirmationCount: 0, lastUpdatedAt: new Date(Date.now() - (1000 * 60 * DIFF_CONFIRMATION_THRESHOLD)) } // subtract by X minutes
          }
        }
      }
  });

  const sameContentUpdateQueries = sameContentDocs.map((doc) => {
    return {
      updateOne: {
        filter: { _id: doc._id },
        update: { changeConfirmationCount: 0 }
      }
    }
  });

  const docUpdateQueries = newContentUpdateQueries.concat(sameContentUpdateQueries);
  const bulkWriteDocsPromise = Doc.bulkWrite(docUpdateQueries, {
    ordered: false
  });

  const newEvents: EventType[] = [];
  
  diffAlerts.forEach(({ doc, diff }) => {
    const updateStatus = getDocUpdateStatus(doc);
    if (updateStatus === 'event-trigger') {
      newEvents.push({
        org: new mongoose.Types.ObjectId(orgId),
        doc: doc._id,
        type: 'change',
        change: diff,
      })

      track(orgId, 'Change detected', {
        isOrg: true,
      })
    }
  });
  const insertManyEventsPromise = Event.insertMany(newEvents);
  const updateSearchDocRecordsPromises: Promise<void>[] = diffAlerts.map(({ doc, newContent}) => {
    return updateDocContentForSearch(doc, newContent);
  });
  const [_, insertManyEventsRes] = await Promise.all([bulkWriteDocsPromise, insertManyEventsPromise, updateSearchDocRecordsPromises]);
  await triggerAutomationsForEvents(orgId, insertManyEventsRes);

  return diffAlerts;
}

scanRouter.post('/org/:orgId', async (req, res) => {
  const { orgId } = req.params;

  try {
    const job = await workQueue.add({orgId});
    res.status(200).json({ id: job.id })
  }
  catch (error) {
    res.status(500).send({error})
  }
});

scanRouter.get('/status/:jobId', async (req, res) => {
  const { jobId } = req.params;

  const job = await workQueue.getJob(jobId);
  
  if (job === null) {
    res.status(404).end();
  } else {
    const state = await job.getState();
    let data;
    if (state === 'completed') {
      data = await job.finished();
    }
    const reason = job.failedReason;
    res.json({ jobId, state, reason, data });
  }
})

scanRouter.put('/global', async (_, res) => {
  const orgs = await Org.find({});
  const orgIds = orgs.map((org) => org._id);
  const startWorkerPromises = orgIds.map((orgId) => {
    return workQueue.add({orgId});
  })

  const jobs = await Promise.all(startWorkerPromises);
  const jobsIds = jobs.map((job) => job.id);
  res.send({jobsIds});
});

export default scanRouter;