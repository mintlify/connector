import express from 'express';
import * as Diff from 'diff';
import Doc from '../models/Doc';
import { getDataFromWebpage } from '../services/webscraper';
// import { getDataFromWebpage } from '../services/webscraper';

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

const getDiffAndContent = async (url: string, previousContent: string): Promise<DiffAndContent> => {
  const { content } = await getDataFromWebpage(url);
  return {
    diff: Diff.diffWords(previousContent, content),
    newContent: content
  }
}

scanRouter.post('/', async (req, res) => {
  const { org } = req.body;
  
  const docsFromOrg = await Doc.find({ org });
  const getDifferencePromises = docsFromOrg.map((doc) => {
    return getDiffAndContent(doc.url, doc.content);
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

  res.send({diffAlerts});
});

export default scanRouter;