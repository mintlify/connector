import express from 'express';
import mongoose from 'mongoose';
import Automation, { AutomationSourceType } from '../models/Automation';
import { deleteAutomationForSearch, indexAutomationForSearch } from '../services/algolia';
import { track } from '../services/segment';
import { userMiddleware } from './user';
import { publishMessage } from '../automations/slack';
import Org from '../models/Org';

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
  });

  indexAutomationForSearch(automation);

  track(res.locals.user.userId, 'Add automation', {
    type,
    org: org.toString(),
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
    const deleteAutomationPromise = Automation.findOneAndDelete({ _id: automationId, org });
    const deleteAutomationForSearchPromise = deleteAutomationForSearch(automationId);
    await Promise.all([deleteAutomationPromise, deleteAutomationForSearchPromise]);
    res.end();
  } catch (error) {
    res.status(500).send({error})
  }
})

automationsRouter.put('/sendAlert', async (req, res) => {
  const org = await Org.findById('6282c3105ae7e75d5ff1fbee');
  if (org) {
    const token = org?.integrations?.slack?.accessToken;
    if (token) {
      await publishMessage('Changes have been made to <https://mintlify.notion.site/Laws-of-Documentation-f167f65678e8495e9af7519a87fca13e|✍️Laws of Documentation>', 'docs', token);
      res.end();
    }
    res.status(500).send('token not found');
  }
  res.status(500).send('org not found');
})

export default automationsRouter;