import TimeAgo from 'javascript-time-ago'
import express from 'express';
import Doc from '../models/Doc';
import { getDataFromWebpage } from '../services/webscraper';

// TimeAgo
import en from 'javascript-time-ago/locale/en.json'
import axios from 'axios';
TimeAgo.addDefaultLocale(en)
const timeAgo = new TimeAgo('en-US')

const docsRouter = express.Router();

docsRouter.get('/', async (req, res) => {
  const { org } = req.query;
  try {
    const docs = await Doc.find({org});
    const docsFormatted = docs.map((doc) => {
      return {
        id: doc._id,
        title: doc.title,
        lastUpdatedAt: timeAgo.format(doc.lastUpdatedAt),
        favicon: doc.favicon,
        url: doc.url
      }
    })
    return res.status(200).send({docs: docsFormatted});
  } catch (error) {
    return res.status(500).send({error, docs: []})
  }
})

docsRouter.post('/', async (req, res) => {
  const { url } = req.body;
  const org = 'mintlify';
  try {
    const { content, method, title } = await getDataFromWebpage(url);
    const faviconRes = await axios.get(`https://s2.googleusercontent.com/s2/favicons?sz=128&domain_url=${url}`);
    const favicon: string = faviconRes.request.res.responseUrl;
    await Doc.findOneAndUpdate({
      org,
      url
    },
    {
      org,
      url,
      method,
      content,
      title,
      favicon
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