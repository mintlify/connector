import axios from 'axios';
import dotenv from 'dotenv';
import { EventType } from '../models/Event';
import { AutomationType } from '../models/Automation';
import Doc, { DocType } from '../models/Doc';
import { getDocumentNameFromUrl } from '../helpers/routes/messages';
import { OrgType } from '../models/Org';

dotenv.config();

export const publishMessage = async (text: string, channel: string, token: string) => {
  const postMessage = async () => {
    const messageUrl = 'https://slack.com/api/chat.postMessage';
    return await axios.post(messageUrl, {
      channel: channel,
      text
    }, { headers: { authorization: `Bearer ${token}` } });
  }
  const handleChannelNotFound = async (err: string) => {
    if (err === 'channel_not_found') {
      const url = 'https://slack.com/api/conversations.create';
      await axios.post(url, {
        name: channel.substring(1)
      }, { headers: { authorization: `Bearer ${token}` } });
      await postMessage();
    }
  }
  try {
    const res = await postMessage();
    await handleChannelNotFound(res.data.error);
  } catch (error: any) {
    await handleChannelNotFound(error?.data?.error);
  }
}

const getSlackMessage = async (event: EventType, automation: AutomationType): Promise<string|null> => {
    if (automation.type === 'doc' && event.type === 'change') {
        const doc: DocType | null = await Doc.findById(event.doc);
        let header = 'Changes have been made to one of your document:';
        if (doc != null) {
            const title = await getDocumentNameFromUrl(doc.url);
            header = `Changes have been made to [${title}](${doc.url}):\n`;
        }
        const changes = event?.change;
        const changesFormatted: string = changes?.filter((change) => {
            return change.count != 1 && !change?.removed;
        })?.map((change) => {
            return `> ${change.value}\n`;
        }).join('\n') ?? '';
        return `${header}${changesFormatted}`;
    } else if (automation.type === 'code') {
        // TODO
    }
    return null;
}

export const slackAutomationForEvent = async (event: EventType, automation: AutomationType, org: OrgType) => {
    const message = await getSlackMessage(event, automation);
    console.log({message});
    const channel = org?.integrations?.slack?.channel;
    console.log({channel});
    const token = org?.integrations?.slack?.accessToken;
    console.log({token})
    if (channel && message && token) {
        await publishMessage(message, channel, token);
    }
};