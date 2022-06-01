import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    userId: { type: String, required: true },
    authMethod: { type: String, default: 'stytch' },
    firstName: { type: String, required: true, },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
    role: { type: String },
    pending: { type: Boolean, default: false, required: true },
    isVSCodeInstalled: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema, 'users');

export default User;