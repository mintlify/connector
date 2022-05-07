import express from 'express';
import { getContentFromWebpage } from '../services/webscraper';

const docsRouter = express.Router();

docsRouter.post('/', async (req, res) => {
  const { url } = req.body;
  try {
    const content = await getContentFromWebpage(url);
    res.send({content});
  } catch (error) {
    res.status(500).send({error})
  }
})

export default docsRouter;