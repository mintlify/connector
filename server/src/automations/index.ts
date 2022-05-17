import { EventType } from '../models/Event';
import Automation, { AutomationType } from '../models/Automation';
import Org, { OrgType } from '../models/Org';
import { slackAutomationForEvent } from './slack';

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
        const isDocEvent = (event.type === 'change' || event.type === 'add') && automation.type === 'doc';
        if (isDocEvent) {
            const isSameDocObj = event.doc === automation.source?.doc;
            if (isSameDocObj) {
                return true;
            }
        }
        return false;
    }).forEach(async (automation) => { 
        switch(automation.destination.type) {
            case 'slack':
                await slackAutomationForEvent(event, automation, org);
        }
    })
}