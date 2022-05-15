import express from 'express';
import mongoose from 'mongoose';
import Automation, { AutomationSourceType } from '../models/Automation';
import { userMiddleware } from './user';


const automationsRouter = express.Router();

// automationsRouter.get('/', userMiddleware, async (req, res) => {
//   const org = res.locals.user.org;
//     return res.send({success: true});
// });

automationsRouter.post('/', userMiddleware, async (req, res) => {
  const { type, sourceValue, destinationType, destinationValue, name } = req.body;
  const org = res.locals.user.org;

  const source: AutomationSourceType = {};
  if (type === 'doc') {
    source.doc = new mongoose.Types.ObjectId(sourceValue);
  }
  else if (type === 'code') {
    source.repo = sourceValue
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
})

export default automationsRouter;