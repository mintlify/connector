import express from 'express';
import Doc from '../models/Doc';
import { getContentFromWebpage } from '../services/webscraper';

const docsRouter = express.Router();

docsRouter.post('/', async (req, res) => {
  const { url } = req.body;
  const org = 'mintlify';
  try {
    const { content, method } = await getContentFromWebpage(url);
    await Doc.findOneAndUpdate({
      org,
      url
    },
    {
      org,
      url,
      method,
      content,
    },
    {
      upsert: true
    });
    res.send({content});
  } catch (error) {
    res.status(500).send({error})
  }
})

export default docsRouter;
