import mongoose, { Schema } from 'mongoose';

export type OrgType = {
    name: string,
    createdAt: Date,
    integrations: {
        slack?: {
            accessToken: string,
        },
        notion?: {
            accessToken: string,
            botId?: string,
            workspaceId?: string,
            workspaceName?: string,
            workspaceIcon?: string,
        },
        github?: Object
    }
}

const OrgSchema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    integrations: {
        github: Object,
        slack: {
            accessToken: { type: String },
        },
        notion: {
            accessToken: { type: String },
            botId: { type: String },
            workspaceId: { type: String },
            workspaceName: { type: String },
            workspaceIcon: { type: String },
        },
    }
});

const Org = mongoose.model<OrgType>('Org', OrgSchema, 'orgs');

export default Org;