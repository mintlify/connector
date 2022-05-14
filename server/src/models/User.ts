import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    org: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String },
});

const User = mongoose.model('User', UserSchema, 'users');

export default User;