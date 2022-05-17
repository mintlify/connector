import mongoose, { Schema, Types } from 'mongoose';

export type EventTypeMeta = 'add' | 'change';

export type EventType = {
    org: Types.ObjectId;
    doc: Types.ObjectId;
    type: EventTypeMeta;
    change?: Object;
    add?: Object;
};

const EventSchema = new Schema({
    org: { type: Schema.Types.ObjectId, required: true },
    doc: { type: Schema.Types.ObjectId, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    change: Object, // only for change events
    add: Object, // only for add events
});

const Event = mongoose.model('Event', EventSchema, 'events');

export default Event;