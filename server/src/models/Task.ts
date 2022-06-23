import mongoose, { Schema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'done';
export type TaskSource = 'github' | 'mintlify';
export type TaskTypeMeta = 'new' | 'update' | 'review';

export type TaskType = {
    org: Types.ObjectId;
    doc: Types.ObjectId;
    code: Types.ObjectId;
    status: TaskStatus;
    type: TaskTypeMeta;
    source: TaskSource;
    createdAt: Date;
    url?: String;
};

const TaskSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    doc: { type: Schema.Types.ObjectId, required: true },
    code: Schema.Types.ObjectId,
    status: { type: String, required: true },
    type: { type: String, required: true },
    source: String,
    createdAt: { type: Date, default: Date.now },
    url: String,
});

const Task = mongoose.model<TaskType>('Task', TaskSchema, 'tasks');

export default Task;
