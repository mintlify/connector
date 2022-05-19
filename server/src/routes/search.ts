import express from 'express';
import { searchDocsAndAutomations } from '../services/algolia';

const searchRouter = express.Router();

searchRouter.get('/', async (req, res) => {
  const { query } = req.body;
    try {
        const results = await searchDocsAndAutomations(query);
        console.log(results);
        return res.end();
    }
    catch (error) {
        return res.status(400).send({error})
    }
});

export default searchRouter;