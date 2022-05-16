import express from 'express';
import Org from '../models/Org';
import { userMiddleware } from './user';

const orgRouter = express.Router();

orgRouter.put('/name', userMiddleware, async (req, res) => {
  const orgId = res.locals.user.org;
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({error: 'Name not provided'});
  }

  try {
    await Org.findByIdAndUpdate(orgId, { name });
    return res.end();
  }
  catch (error) {
    return res.status(500).send({error});
  }
});

export default orgRouter;