import express from "express";
import User from "../models/User"
import Org from "../models/Org"
import mongoose from "mongoose";

const orgRouter = express.Router();

// Given an orgId from the request query, return the organization object that matches the id
orgRouter.get('/', async (req: any, res: express.Response) => {
  const {orgId} = req.query

  if (!orgId)
    return res.status(400).json({ error: 'orgId not provided' });

  const org = await Org.findById(new mongoose.Types.ObjectId(orgId.toString())).exec().catch(err => {
    return res.status(500).json({err})
  });

  return res.status(200).json({org})
})

// Given an orgId from the request query, return all the user objects within that organization
orgRouter.get('/list-users', async (req: any, res: express.Response) => {
  const { orgId } = req.query;

  if (!orgId)
    return res.status(400).json({ error: 'orgId not provided' });

  const users = await User.find({org: new mongoose.Types.ObjectId(orgId.toString())}).exec().catch(err => {
    return res.status(500).json({error: err});
  });
  
  return res.status(200).json({users})
});

export default orgRouter;