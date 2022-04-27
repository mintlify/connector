import mongoose from 'mongoose';

const { Schema } = mongoose;

export type NotionAuthConnectorType = {
  accessToken: string,
  botId?: string,
  workspaceId?: string,
  workspaceName?: string,
  workspaceIcon?: string,
}

export type AuthConnectorType = {
  source: string,
  sourceId: string,
  notion: NotionAuthConnectorType,
  alerts: boolean,
  gitbook: boolean
}

const NotionAuthConnectorSchema = new Schema({
  accessToken: { type: String, required: true },
  botId: { type: String },
  workspaceId: { type: String },
  workspaceName: { type: String },
  workspaceIcon: { type: String },
})

const AuthConnectorSchema = new Schema({
    source: { type: String, required: true },
    sourceId: { type: String, required: true },
    alerts: { type: Boolean },
    gitbook: { type: Boolean },
    notion: { type: NotionAuthConnectorSchema }
})

const AuthConnector = mongoose.model<AuthConnectorType>('AuthConnector', AuthConnectorSchema, 'authConnectors');

export default AuthConnector;
