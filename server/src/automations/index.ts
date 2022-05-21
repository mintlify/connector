import { EventType } from '../models/Event';
import Automation, { AutomationType } from '../models/Automation';
import Org, { OrgType } from '../models/Org';
import { slackAutomationForEvent } from './slack';
import { sendEmail } from '../services/mandrill';
import { triggerWebhook } from '../services/webhook';

export const triggerAutomationsForEvents = async (orgId: string, events: EventType[]) => {
    const automationsFromOrg = await Automation.find({ org: orgId });
    const orgObj = await Org.findById(orgId);
    if (orgObj != null) {
        events.forEach(async (event) => {
            await triggerAutomations(event, automationsFromOrg, orgObj);
        })
    }
}

export const triggerAutomations = async (event: EventType, automations: AutomationType[], org: OrgType) => {
    automations.filter((automation) => {
        const isSameDocObj = event.doc.toString() === automation.source?.doc?.toString();
        if (isSameDocObj) {
            return true;
        }
        return false;
    }).forEach(async (automation) => { 
        switch (automation.destination.type) {
            case 'slack':
                slackAutomationForEvent(event, automation, org);
                break;
            case 'email':
                sendEmail(automation.destination.value);
                break;
            case 'webhook':
                triggerWebhook(automation.destination.value);
                break;
            default:
                return;
        }
    })
}