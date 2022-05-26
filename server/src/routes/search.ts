import express from 'express';
import { searchDocsAndAutomations } from '../services/algolia';
import { track } from '../services/segment';
import { userMiddleware } from './user';

const searchRouter = express.Router();

searchRouter.get('/', async (req, res) => {
  const query = req.query.query as string;
  const orgId = req.query.orgId as string;

  if (!orgId || !query) {
    return res.send({results: { docs: [], automations: [] }});
  }

  try {
    const results = await searchDocsAndAutomations(query, orgId);
    return res.send({results});
  }
  catch (error) {
    return res.status(400).send({error})
  }
});

searchRouter.get('/click', userMiddleware, async (_, res) => {
  track(res.locals.user.userId, "Click on search result");
  res.end();
})

export default searchRouter;