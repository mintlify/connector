import express from 'express';
import * as Diff from 'diff';
import Doc, { DocType } from '../models/Doc';
import Event, { EventType } from '../models/Event';
import { getDataFromWebpage } from '../services/webscraper';
import { triggerAutomationsForEvents } from '../automations';
import { updateDocContentForSearch } from '../services/algolia';
import { workQueue } from '../workers';
import mongoose from 'mongoose';
import Org from '../models/Org';

const scanRouter = express.Router();

type DiffAndContent = {
  diff: Diff.Change[],
  newContent: string,
}

type DiffAlert = {
  diff: Diff.Change[],
  newContent: string,
  doc: DocType
}

type DocUpdateStatus = 'first-change' | 'continuous-change' | 'event-trigger';

const DIFF_CONFIRMATION_THRESHOLD = 2;

const getDiffAndContent = async (url: string, previousContent: string, orgId: string): Promise<DiffAndContent> => {
  const { content } = await getDataFromWebpage(url, orgId);
  return {
    diff: Diff.diffWords(previousContent, content),
    newContent: content
  }
}

const getDocUpdateStatus = (doc: DocType): DocUpdateStatus => {
  if (doc.changeConfirmationCount == null) {
    return 'first-change'
  } else if (doc.changeConfirmationCount < DIFF_CONFIRMATION_THRESHOLD) {
    return 'continuous-change'
  }
  return 'event-trigger';
}

export const scanDocsInOrg = async (orgId: string) => {
  const docsFromOrg = await Doc.find({ org: orgId });
  const getDifferencePromises = docsFromOrg.map((doc) => {
    return getDiffAndContent(doc.url, doc.content ?? '', orgId);
  });

  const diffsAndContent = await Promise.all(getDifferencePromises);

  const diffAlerts: DiffAlert[] = [];
  const sameContentDocs: DocType[] = [];
  diffsAndContent.forEach(({ diff, newContent }, i) => {
    const hasChanges = diff.some((diff) => (diff.added || diff.removed) && diff.value.trim());
    const doc = docsFromOrg[i];
    if (hasChanges) {
      diffAlerts.push({
        doc,
        newContent,
        diff
      });
    } else {
      sameContentDocs.push(doc);
    }
  });

  const newContentUpdateQueries = diffAlerts.map(({ doc, newContent }) => {
    const updateStatus = getDocUpdateStatus(doc);
    switch (updateStatus) {
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