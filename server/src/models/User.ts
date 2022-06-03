import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    // userId, firstName, and lastName are not required for inviting members
    userId: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    authMethod: { type: String, default: 'stytch' },
    email: { type: String, required: true },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
    role: { type: String },
    pending: { type: Boolean, default: false, required: true },
    isVSCodeInstalled: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema, 'users');

export default User;