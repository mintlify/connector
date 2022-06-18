import express from 'express';
import { searchDocs } from '../services/algolia';
import { track } from '../services/segment';
import { userMiddleware } from './user';

const searchRouter = express.Router();

searchRouter.get('/', async (req, res) => {
  const query = req.query.query as string;
  const orgId = req.query.orgId as string;

  if (!orgId || !query) {
    return res.send({results: { docs: [] }});
  }

  try {
    const results = await searchDocs(query, orgId);
    return res.send({results});
  }
  catch (error) {
    return res.status(400).send({error})
  }
});

searchRouter.get('/click', userMiddleware, async (_, res) => {
  track(res.locals.user.userId, "Click on search result", {
    org: res.locals.user.org._id.toString(),
  });
  res.end();
})

export default searchRouter;