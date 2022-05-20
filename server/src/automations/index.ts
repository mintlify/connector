import { EventType } from '../models/Event';
import Automation, { AutomationType } from '../models/Automation';
import Org, { OrgType } from '../models/Org';
import { slackAutomationForEvent } from './slack';
import { sendEmail } from '../services/mandrill';
import { triggerWebhook } from '../services/webhook';

export const triggerAutomationsForEvents = async (orgId: string, events: EventType[]) => {
    const automationsFromOrg = await Automation.find({ org: orgId });
    const orgObj = await Org.findById(orgId);
    console.log({automationsFromOrg});
    console.log({orgObj});
    if (orgObj != null) {
        events.forEach(async (event) => {
            console.log({event});
            await triggerAutomations(event, automationsFromOrg, orgObj);
        })
    }
}

export const triggerAutomations = async (event: EventType, automations: AutomationType[], org: OrgType) => {
    console.log('triggerAutomations');
    automations.filter((automation) => {
        const isDocEvent = (event.type === 'change' || event.type === 'add') && automation.type === 'doc';
        if (isDocEvent) {
            const isSameDocObj = event.doc === automation.source?.doc;
            if (isSameDocObj) {
                console.log({isSameDocObj});
                console.log({automation});
                return true;
            }
        }
        console.log({automation});
        console.log(automation.source?.doc);
        console.log(false);
        return false;
    }).forEach(async (automation) => { 
        switch (automation.destination.type) {
            case 'slack':
                console.log('slackkkk');
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