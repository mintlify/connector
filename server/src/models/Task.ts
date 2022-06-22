import mongoose, { Schema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'done' 
export type TaskTypeMeta = 'new' | 'update'

export type TaskType = {
    org: Types.ObjectId;
    doc: Types.ObjectId;
    status: TaskStatus;
    type: TaskTypeMeta;
    url?: String;
};

const TaskSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    doc: { type: Schema.Types.ObjectId, required: true },
    code: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    url: String
});

const Task = mongoose.model<TaskType>('Task', TaskSchema, 'tasks');

export default Task;
