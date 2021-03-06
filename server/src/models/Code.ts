import mongoose, { Schema, Types } from 'mongoose';

export type CodeType = {
    _id: Types.ObjectId;
    doc: Types.ObjectId;
    sha: string;
    provider: string;
    file: string;
    org: Types.ObjectId;
    gitOrg: string;
    repo: string;
    type: string;
    url: string;
    branch?: string;
    line?: number;
    endLine?: number;
};

const CodeSchema = new Schema({
    doc: { type: Schema.Types.ObjectId, required: true },
    sha: { type: String, required: true },
    provider: { type: String, required: true },
    file: { type: String, required: true },
    gitOrg: { type: String, required: true },
    org: { type: Schema.Types.ObjectId, required: true },
    repo: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    branch: { type: String },
    line: { type: Number },
    endLine: { type: Number },
    createdBy: { type: Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
});

const Code = mongoose.model<CodeType>('Code', CodeSchema, 'code');

export default Code;
