import express from 'express';
import * as Diff from 'diff';
import Doc from '../models/Doc';
import { getDataFromWebpage } from '../services/webscraper';
// import { getDataFromWebpage } from '../services/webscraper';

const scanRouter = express.Router();

const getDiff = async (url: string, previousContent: string) => {
  const { content } = await getDataFromWebpage(url);
  return Diff.diffWordsWithSpace(previousContent, content);
}

scanRouter.post('/', async (req, res) => {
  const { org } = req.body;
  
  const docsFromOrg = await Doc.find({ org });
  const getDifferencePromises = docsFromOrg.map((doc) => {
    return getDiff(doc.url, doc.content);
  });

  const diffs = await Promise.all(getDifferencePromises);
  console.log(diffs);

  res.end();
});

export default scanRouter;