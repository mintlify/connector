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
        github?: {
            id: string
        }
    }
}

const SlackIntegrationSchema = new Schema({
    accessToken: { type: String, required: true },
})

const NotionIntegrationSchema = new Schema({
    accessToken: { type: String, required: true },
    botId: { type: String },
    workspaceId: { type: String },
    workspaceName: { type: String },
    workspaceIcon: { type: String },
})

const IntegrationsSchema = new Schema({
    github: { type: Object },
    slack: { type: SlackIntegrationSchema },
    notion: { type: NotionIntegrationSchema },
})

const OrgSchema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    integrations: { type: IntegrationsSchema, default: {} },
});

const Org = mongoose.model<OrgType>('Org', OrgSchema, 'orgs');

export default Org;