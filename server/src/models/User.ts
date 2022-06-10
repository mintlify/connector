import mongoose, { Schema, Types } from 'mongoose';

export type UserType = {
    userId: string,
    firstName?: string,
    lastName?: string,
    authMethod: string,
    email: string,
    profilePicture?: string,
    createdAt: Date,
    role?: string,
    pending: boolean,
    isVSCodeInstalled: boolean,
    onboarding?: {
        role: string,
        usingVSCode: boolean,
    },
    org?: Types.ObjectId,
}

const UserSchema = new Schema({
    // userId, firstName, and lastName are not required for inviting members
    userId: String,
    firstName: String,
    lastName: String,
    authMethod: { type: String, default: 'stytch' },
    email: { type: String, required: true },
    profilePicture: String,
    createdAt: { type: Date, default: Date.now },
    role: String,
    pending: { type: Boolean, default: false, required: true },
    isVSCodeInstalled: { type: Boolean, default: false },
    onboarding: {
        role: String,
        usingVSCode: Boolean,
    }
});

const User = mongoose.model<UserType>('User', UserSchema, 'users');

export default User;
