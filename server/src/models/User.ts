import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
    userId: { type: String },
    authMethod: { type: String, default: 'stytch' },
    firstName: { type: String},
    lastName: { type: String},
    email: { type: String, required: true },
    org: { type: mongoose.Schema.Types.ObjectId, required: true },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
    role: { type: String },
    pending: {type: Boolean, default: true, required: true}
});

const User = mongoose.model('User', UserSchema, 'users');

export default User;