import express from 'express';
import * as Diff from 'diff';
import Doc from '../models/Doc';
import { getDataFromWebpage } from '../services/webscraper';
// import { getDataFromWebpage } from '../services/webscraper';

const scanRouter = express.Router();

const getDifference = async (url: string, previousContent: string) => {
  const { content } = await getDataFromWebpage(url);

  const diff = Diff.diffWordsWithSpace(previousContent, content);
  console.log(diff);
}

scanRouter.post('/', async (req, res) => {
  const { org } = req.body;
  
  const docsFromOrg = await Doc.find({ org });
  const getDifferencePromises = docsFromOrg.map((doc) => {
    return getDifference(doc.url, doc.content);
  });

  await Promise.all(getDifferencePromises);

  res.end();
});

export default scanRouter;