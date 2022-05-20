import express from 'express';
import mongoose from 'mongoose';
import { triggerAutomationsForEvents } from '../automations';
import Automation, { AutomationSourceType } from '../models/Automation';
import { EventType } from '../models/Event';
import { deleteAutomationForSearch, indexAutomationForSearch } from '../services/algolia';
import { userMiddleware } from './user';
import Doc from '../models/Doc';


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

  indexAutomationForSearch(automation);
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

automationsRouter.get('/testSlack', userMiddleware, async (_, res) => {
  const { org } = res.locals.user;
  const docs = await Doc.find({ org, url: 'https://mintlify.notion.site/Mintlify-Connect-c77063caf3f6492e85badd026b769a69' });
  if (docs) {
    const events: EventType[] = [
      {
        org,
        doc: docs[0]._id,
        type: 'change',
        change: [
          {
            count: 45,
            value: '🚀 QuickstartGet up and running with auto generated documentation for codeIntegrate Mintlify into your app to generate documentation in less than 2 minutes'
          },
          {
            count: 19,
            value: 'Follow the instructions below to make your first request.'
          }
        ]
      }
    ];
    await triggerAutomationsForEvents(org, events);
    res.end();
  }
})

export default automationsRouter;