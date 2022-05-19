import express from 'express';
import { searchDocsAndAutomations } from '../services/algolia';

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
    console.log(error);
    return res.status(400).send({error})
  }
});

export default searchRouter;