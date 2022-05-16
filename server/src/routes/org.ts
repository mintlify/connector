import express from 'express';
import Org from '../models/Org';
import { userMiddleware } from './user';

const orgRouter = express.Router();

orgRouter.put('/:orgId/name', userMiddleware, async (req, res) => {
  const { orgId } = req.params;
  const userOrgId = res.locals.user.org.toString();
  const { name } = req.body;

  if (!name) {
    return res.status(400).send({error: 'Name not provided'});
  }

  if (userOrgId !== orgId) {
    return res.status(403).send({error: 'User does not have permission'});
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