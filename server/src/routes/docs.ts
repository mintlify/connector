import express from 'express';
import { Types } from 'mongoose';
import Doc from '../models/Doc';
import { getDataFromWebpage } from '../services/webscraper';
import axios from 'axios';
import { userMiddleware } from './user';

const docsRouter = express.Router();

// userId is the _id of the user not `userId`
export const createDocFromUrl = async (url: string, orgId: string, userId: Types.ObjectId) => {
  const { content, method, title, favicon } = await getDataFromWebpage(url, orgId);
  let foundFavicon = favicon;
  if (!foundFavicon) {
    try {
      const faviconRes = await axios.get(`https://s2.googleusercontent.com/s2/favicons?sz=128&domain_url=${url}`);
      foundFavicon = faviconRes.request.res.responseUrl;
    }
    catch {
      foundFavicon = undefined;
    }
  }
  const doc = await Doc.findOneAndUpdate({
    org: orgId,
    url
  },
  {
    org: orgId,
    url,
    method,
    content,
    title,
    favicon,
    createdBy: userId,
  },
  {
    upsert: true
  });

  return { content, doc }
}

docsRouter.get('/', userMiddleware, async (_, res) => {
  const org = res.locals.user.org;
  try {
    const docs = await Doc.aggregate([
      {
        $match: { org }
      },
      {
        $sort: { lastUpdatedAt: -1 },
      },
      {
        $lookup: {
          from: "code",
          let: { doc: "$_id" },
          pipeline: [
             { $match:
                { $expr:
                   { $and:
                      [
                        { $eq: [ "$doc",  "$$doc" ] },
                        { $eq: [ "$org",  org ] },
                      ]
                   }
                }
             },
             { $project: { stock_item: 0, _id: 0 } }
          ],
          as: "code"
        }
      }
    ]);
    return res.status(200).send({docs});
  } catch (error) {
    return res.status(500).send({error, docs: []})
  }
})

docsRouter.post('/', userMiddleware, async (req, res) => {
  const { url } = req.body;
  const org = res.locals.user.org;
  try {
    const { content } = await createDocFromUrl(url, org, res.locals.user._id);
    res.send({content});
  } catch (error) {
    res.status(500).send({error})
  }
})

export default docsRouter;
