import express from 'express';
import mongoose from 'mongoose';
import Automation, { AutomationSourceType } from '../models/Automation';
import { userMiddleware } from './user';


const automationsRouter = express.Router();

automationsRouter.get('/', userMiddleware, async (_, res) => {
  const org = res.locals.user.org;

  const automations = await Automation.aggregate([
    { $match: { org } },
    { $lookup: {
        from: "docs",
        localField: "source.doc",
        foreignField: "_id",
        as: "source.doc"
    } },
    {
      $set: {
        "source.doc": { $first: "$source.doc" }
      }
    },
    {
      $set: {
        "source.doc": "$source.doc.title"
      }
    }
  ]);

  return res.send({automations});
});

automationsRouter.post('/', userMiddleware, async (req, res) => {
  const { type, sourceValue, destinationType, destinationValue, name } = req.body;
  const org = res.locals.user.org;

  const source: AutomationSourceType = {};
  if (type === 'doc') {
    source.doc = new mongoose.Types.ObjectId(sourceValue);
  }
  else if (type === 'code') {
    source.repo = sourceValue;
  }

  const automation = await Automation.create({
    org,
    type,
    source,
    destination: {
      type: destinationType,
      value: destinationValue
    },
    name,
    createdBy: res.locals.user._id
  })

  return res.send({automation});
});

automationsRouter.put('/active', userMiddleware, async (req, res) => {
  const { automationId, isActive } = req.body;
  const org = res.locals.user.org;

  await Automation.findOneAndUpdate({ org, _id: automationId }, { isActive });
  res.end();
});

automationsRouter.delete('/:automationId', userMiddleware, async (req, res) => {
  const { automationId } = req.params;
  const { org } = res.locals.user;
  
  try {
    await Automation.findOneAndDelete({ _id: automationId, org });
    res.end();
  } catch (error) {
    res.status(500).send({error})
  }
})

export default automationsRouter;