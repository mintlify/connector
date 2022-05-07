import mongoose, { Schema } from 'mongoose';

const LinkSchema = new Schema({
    doc: { type: String, required: true },
    url: { type: String },
    sha: { type: String, required: true },
    provider: { type: String, required: true },
    file: { type: String, required: true },
    org: { type: String, required: true },
    repo: { type: String, required: true },
    type: { type: String, required: true },
    branch: { type: String },
    line: { type: Number },
    endLine: { type: Number }
});

const Link = mongoose.model('Link', LinkSchema, 'links');

export default Link;