export interface ContactPresence {
    status: ContactPresenceStatus;
    statusText: string;
}
export type ContactPresenceStatus = 'online' | 'away' | 'busy' | 'dnd' | 'offline';