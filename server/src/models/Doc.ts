import mongoose, { Schema } from 'mongoose';

export type DocType = {
    org: string;
    url: string;
    method: string;
    content?: string;
    lastUpdatedAt: Date;
    createdAt: Date;
}

const DocSchema = new Schema({
    org: { type: String, required: true },
    url: { type: String, required: true },
    method: { type: String, required: true },
    content: { type: String },
    lastUpdatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
});

const Doc = mongoose.model('Doc', DocSchema, 'docs');

export default Doc;