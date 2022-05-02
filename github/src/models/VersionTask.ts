import mongoose from 'mongoose';
import { AlertsRequest } from '../helpers/types';

const { Schema } = mongoose;

export type VersionTaskType = {
  github: AlertsRequest,
  url: string,
  content: string,
  createdAt: Date,
  lastUpdatedAt: Date,
}

const GitHubSchema = new Schema({
  installationId: { type: Number, required: true },
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  pullNumber: { type: Number, required: true },
})

const VersionTaskSchema = new Schema({
  github: { type: GitHubSchema },
  installationId: { type: String, required: true },  
  url: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastUpdatedAt: { type: Date, default: Date.now },
})

const VersionTask = mongoose.model<VersionTaskType>('VersionTask', VersionTaskSchema, 'versionTasks');

export default VersionTask;
