import mongoose, { Schema } from 'mongoose';

const OrgSchema = new Schema({
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Org = mongoose.model('Org', OrgSchema, 'orgs');

export default Org;