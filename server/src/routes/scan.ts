import express from 'express';
import * as Diff from 'diff';
import Doc from '../models/Doc';
import Event from '../models/Event';
import { getDataFromWebpage } from '../services/webscraper';

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

scanRouter.post('/', async (req, res) => {
  const { org } = req.body;

  try {
    const docsFromOrg = await Doc.find({ org });
    const getDifferencePromises = docsFromOrg.map((doc) => {
      return getDiffAndContent(doc.url, doc.content, org);
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
        })
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

    const newEvents = diffAlerts.map((alert) => {
      return {
        org,
        doc: alert.doc._id,
        event: 'change',
        change: alert.diff,
      }
    });
    const insertManyEventsPromise = Event.insertMany(newEvents);
    await Promise.all([bulkWriteDocsPromise, insertManyEventsPromise]);

    res.send({diffAlerts});
  }

  catch (error) {
    res.status(500).send({error})
  }
});

export default scanRouter;