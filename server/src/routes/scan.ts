import express from 'express';
import * as Diff from 'diff';
import Doc from '../models/Doc';
import Event, { EventType } from '../models/Event';
import { getDataFromWebpage } from '../services/webscraper';
import { triggerAutomationsForEvents } from '../automations';
import { updateDocContentForSearch } from '../services/algolia';
import { workQueue } from '../workers';
import mongoose from 'mongoose';

const scanRouter = express.Router();

type DiffAndContent = {
  diff: Diff.Change[],
  newContent: string,
}

type DiffAlert = {
  diff: Diff.Change[],
  newContent: string,
  doc: any
}

const getDiffAndContent = async (url: string, previousContent: string, orgId: string): Promise<DiffAndContent> => {
  const { content } = await getDataFromWebpage(url, orgId);
  return {
    diff: Diff.diffWords(previousContent, content),
    newContent: content
  }
}

export const scanDocsInOrg = async (orgId: string) => {
  const docsFromOrg = await Doc.find({ org: orgId });
  const getDifferencePromises = docsFromOrg.map((doc) => {
    return getDiffAndContent(doc.url, doc.content ?? '', orgId);
  });

  const diffsAndContent = await Promise.all(getDifferencePromises);

  const diffAlerts: DiffAlert[] = [];
  diffsAndContent.forEach(({ diff, newContent }, i) => {
    const hasChanges = diff.some((diff) => diff.added || diff.removed);
    if (hasChanges) {
      diffAlerts.push({
        doc: docsFromOrg[i],
        newContent,
        diff
      });
    }
  });

  const docUpdateQueries = diffAlerts.map(({ doc, newContent }) => {
    return {
      updateOne: {
        filter: { _id: doc._id },
        update: { content: newContent, lastUpdatedAt: new Date() }
      }
    }
  })

  const bulkWriteDocsPromise = Doc.bulkWrite(docUpdateQueries, {
    ordered: false
  });

  const newEvents: EventType[] = diffAlerts.map((alert) => {
    return {
      org: new mongoose.Types.ObjectId(orgId),
      doc: alert.doc._id,
      type: 'change',
      change: alert.diff,
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

scanRouter.post('/:orgId', async (req, res) => {
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

// scanRouter.put('/global', async (_, res) => {
//   const orgs = await Org.find({});
//   const orgIds = orgs.map((org) => org._id);
//   workQueue.add(orgIds);
//   res.send('Initializing global scan');
// });

export default scanRouter;