// TODO - Re-add email after the template is ready
import { EventType } from '../models/Event';
import Org, { OrgType } from '../models/Org';
import { slackAutomationForEvent } from './slack';
// import { sendEmailToAllMembersOfOrg } from '../services/mandrill';
import Doc, { DocType } from '../models/Doc';

export const triggerAutomationsForEvents = async (orgId: string, events: EventType[]) => {
    const orgObj = await Org.findById(orgId);
    if (orgObj != null) {
        events.forEach(async (event) => {
            await triggerAutomations(event, orgObj);
        })
    }
}

export const triggerAutomations = async (event: EventType, org: OrgType) => {
    const doc: DocType | null = await Doc.findById(event.doc);
    if (doc == null) {
        return;
    }
    const isSlackOn = doc?.slack ?? true;
    // const isEmailOn = doc?.email ?? true;

    if (isSlackOn) { slackAutomationForEvent(event, org, doc); }
    // if (isEmailOn) { sendEmailToAllMembersOfOrg(org); }
}
