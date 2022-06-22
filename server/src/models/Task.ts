import mongoose, { Schema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'done';
export type TaskAction = 'new' | 'update';
export type TaskSource = 'github' | 'mintlify';

export type TaskType = {
    org: Types.ObjectId;
    doc: Types.ObjectId;
    code: Types.ObjectId;
    status: TaskStatus;
    action: TaskAction;
    source: TaskSource;
    url?: String;
};

const TaskSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    doc: { type: Schema.Types.ObjectId, required: true },
    code: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, required: true },
    action: { type: String, required: true },
    source: String,
    createdAt: { type: Date, default: Date.now },
    url: String
});

const Task = mongoose.model<TaskType>('Task', TaskSchema, 'tasks');

export default Task;
