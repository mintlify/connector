import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    userId: { type: String, required: true },
    authMethod: { type: String, default: 'stytch' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    org: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String },
});

const User = mongoose.model('User', UserSchema, 'users');

export default User;