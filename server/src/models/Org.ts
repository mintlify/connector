import mongoose, { Schema, Types } from "mongoose";

export type OrgType = {
  _id: Types.ObjectId;
  name: string;
  subdomain: string;
  createdAt: Date;
  logo: string;
  favicon: string;
  integrations: {
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
      accessToken: string;
      botId?: string;
      workspaceId?: string;
      workspaceName?: string;
      workspaceIcon?: string;
    };
    github?: {
      installations: Object[];
    };
  };
  users: string[],
  notifications: {
    monthlyDigest: boolean,
    newsletter: boolean,
  }
};

const OrgSchema = new Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  users: { type: [String], default: []},
  logo: { type: String, required: true },
  favicon: { type: String, required: true },
  integrations: {
    github: Object,
    slack: {
      accessToken: { type: String },
      appId: { type: String },
      team: {
        id: { type: String },
        name: { type: String },
      },
      channel: { type: String },
      channelId: { type: String },
      configurationUrl: { type: String },
    },
    notion: {
      accessToken: { type: String },
      botId: { type: String },
      workspaceId: { type: String },
      workspaceName: { type: String },
      workspaceIcon: { type: String },
    },
  },
  notifications: {
    monthlyDigest: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: true },
  },
});

const Org = mongoose.model<OrgType>("Org", OrgSchema, "orgs");

export default Org;
