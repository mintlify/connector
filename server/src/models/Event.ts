import mongoose, { Schema, Types } from 'mongoose';
import * as Diff from 'diff';

export type EventTypeMeta = 'add' | 'change' | 'code';

export type EventType = {
    org: Types.ObjectId;
    doc: Types.ObjectId;
    type: EventTypeMeta;
    change?: Array<Diff.Change>;
    add?: Object;
    code?: Object;
};

const EventSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    doc: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    change: Array, // only for change events
    add: Object, // only for add events
    code: Object // only for code events
});

const Event = mongoose.model<EventType>('Event', EventSchema, 'events');

export default Event;
