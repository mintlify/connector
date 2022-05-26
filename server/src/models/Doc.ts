import mongoose, { Schema, Types } from 'mongoose';

export type DocType = {
    _id: Types.ObjectId;
    org: string;
    url: string;
    method: string;
    favicon?: string;
    content?: string;
    title?: string;
    lastUpdatedAt: Date;
    createdAt: Date;
    changeConfirmationCount?: number;
};

const DocSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    url: { type: String, required: true },
    method: { type: String, required: true },
    content: { type: String },
    title: { type: String },
    favicon: { type: String },
    lastUpdatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId },
    changeConfirmationCount: { type: Number }
});

const Doc = mongoose.model<DocType>('Doc', DocSchema, 'docs');

export default Doc;