import mongoose, { Schema } from 'mongoose';
import { OrgType } from './Org';

export type UserType = {
    userId: string,
    anonymousId?: {
        type: string,
        id: string,
    },
    firstName?: string,
    lastName?: string,
    authMethod: string,
    email?: string,
    profilePicture?: string,
    createdAt: Date,
    createdBy: string,
    role?: string,
    pending: boolean,
    isVSCodeInstalled: boolean,
    onboarding?: {
        isCompleted: boolean,
        role: string,
        usingVSCode: boolean,
    },
    org?: OrgType,
}

const UserSchema = new Schema({
    // userId, firstName, and lastName are not required for inviting members
    userId: String,
    firstName: String,
    lastName: String,
    authMethod: { type: String, default: 'stytch' },
    email: String,
    profilePicture: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: String,
    role: String,
    pending: { type: Boolean, default: false, required: true },
    isVSCodeInstalled: { type: Boolean, default: false },
    onboarding: {
        isCompleted: Boolean,
        role: String,
        usingVSCode: Boolean,
    },
    // Used for unauthenticated users
    anonymousId: {
        type: String,
        id: String,
    },
});

const User = mongoose.model<UserType>('User', UserSchema, 'users');

export default User;
