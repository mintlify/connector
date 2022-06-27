import mongoose, { Schema, Types } from 'mongoose';
import { ConfluenceCredentials } from '../routes/integrations/confluence';
import { GoogleDocsCredentials } from '../services/googleDocs';

export type OrgType = {
  _id: Types.ObjectId;
  name: string;
  subdomain: string;
  createdAt: Date;
  logo?: string;
  favicon?: string;
  integrations?: {
    slack?: {
      accessToken: string;
      appId: string;
      team: {
        id: string;
        name: string;
      };
      channel: string;
      channelId: string;
      configurationUrl: string;
    };
    notion?: {
      access_token: string;
      bot_id?: string;
      workspace_id?: string;
      workspace_name?: string;
      workspace_icon?: string;
    };
    github?: {
      installations: Object[];
    };
    google?: GoogleDocsCredentials;
    confluence?: ConfluenceCredentials;
  };
  importStatus?: {
    notion?: boolean,
    github?: boolean,
    confluence?: boolean,
    googledocs?: boolean,
  },
  users: string[];
  invitedEmails?: string[];
  notifications: {
    monthlyDigest: boolean;
    newsletter: boolean;
  };
  access: {
    mode: string;
  },
  onboarding?: {
    teamSize: string;
    usingGitHub: boolean;
    usingSlack: boolean;
    usingNone: boolean;
  },
  plan?: {
    name: 'free' | 'pro',
    subscribedAt: Date,
    customerId: string
  }
};

const OrgSchema = new Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  users: { type: [String], default: [] },
  invitedEmails: { type: [String], default: [] },
  logo: String,
  favicon: String,
  integrations: {
    github: Object,
    slack: {
      accessToken: String,
      appId: String,
      team: {
        id: String,
        name: String,
      },
      channel: String,
      channelId: String,
      configurationUrl: String,
    },
    notion: {
      access_token: String,
      bot_id: String,
      workspace_id: String,
      workspace_name: String,
      workspace_icon: String,
    },
    google: {
      refresh_token: String,
      expiry_date: String,
      access_token: String,
      token_type: String,
      id_token: String,
      scope: String,
    },
    confluence: {
      access_token: String,
      expires_in: String,
      refresh_token: String,
      scope: String,
      accessibleResources: [{
        id: String,
        url: String,
        name: String,
        scopes: [String],
        avatarUrl: String
      }]
    }
  },
  importStatus: {
    notion: Boolean,
    confluence: Boolean,
    googledocs: Boolean,
    github: Boolean,
  },
  notifications: {
    monthlyDigest: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true },
  },
  access: {
    mode: { type: String, default: 'private' },
  },
  onboarding: {
    teamSize: String,
    usingGitHub: Boolean,
    usingSlack: Boolean,
    usingNone: Boolean,
  },
  plan: {
    name: { type: String, default: 'free' },
    subscribedAt: { type: Date, default: Date.now },
    customerId: String,
  }
});

const Org = mongoose.model<OrgType>('Org', OrgSchema, 'orgs');

export default Org;
