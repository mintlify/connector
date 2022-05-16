import mongoose, { Schema, Types } from 'mongoose';

export type AutomationSourceType = {
  doc?: Types.ObjectId, // used for doc
  repo?: string // used for code
}

export type AutomationType = {
  org: Types.ObjectId,
  type: 'doc' | 'code',
  source: AutomationSourceType,
  destination: {
    type: 'email' | 'slack' | 'webhook',
    value: string,
  },
  name: string,
  isActive: boolean,
  createdAt: Date,
  createdBy: Types.ObjectId
}

const AutomationSchema = new Schema({
  org: { type: mongoose.Schema.Types.ObjectId, required: true },
  type: { type: String, required: true },
  source: {
    doc: { type: Schema.Types.ObjectId },
    repo: { type: String },
  },
  destination: {
    type: { type: String, required: true },
    value: { type: String },
  },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId },
});

const Automation = mongoose.model<AutomationType>('Automation', AutomationSchema, 'automations');

export default Automation;