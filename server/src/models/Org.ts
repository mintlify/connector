import mongoose, { Schema, Types } from 'mongoose';

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
    google?: {
      refresh_token?: string | null;
      expiry_date?: number | null;
      access_token?: string | null;
      token_type?: string | null;
      id_token?: string | null;
      scope?: string;
    };
  };
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
  }
});

const Org = mongoose.model<OrgType>('Org', OrgSchema, 'orgs');

export default Org;
