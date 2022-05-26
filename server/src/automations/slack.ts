import axios from 'axios';
import dotenv from 'dotenv';
import { EventType } from '../models/Event';
import { AutomationType } from '../models/Automation';
import Doc, { DocType } from '../models/Doc';
import { getDocumentNameFromUrl } from '../helpers/routes/messages';
import { OrgType } from '../models/Org';
import Code, { CodeType } from '../models/Code';

dotenv.config();

export const publishMessage = async (text: string, channel: string, token: string) => {
  const postMessage = async () => {
    const messageUrl = 'https://slack.com/api/chat.postMessage';
    return await axios.post(messageUrl, {
      channel: channel,
      text,
      mrkdwn: true
    }, { headers: { authorization: `Bearer ${token}` } });
  }
  const handleChannelNotFound = async (err: string) => {
    if (err === 'channel_not_found') {
      const url = 'https://slack.com/api/conversations.create';
      await axios.post(url, {
        name: channel
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
      const doc: DocType | null = await Doc.findById(event.doc);
      let title = 'your document';
      if (doc != null) {
        title = await getDocumentNameFromUrl(doc.url);
      }
      if (automation.type === 'doc' && event.type === 'change') {
        return `Changes have been made to <${doc?.url}|${title}>`;
    } else if (automation.type === 'code') {
      const code: CodeType | null = await Code.findById(event.code);

      return `Changes have been made to <${code?.url}|code> connected to <${doc?.url}|${title}>. Do you need to update your document to reflect the changes?`;
    }
    return null;
}

export const slackAutomationForEvent = async (event: EventType, automation: AutomationType, org: OrgType) => {
    const message = await getSlackMessage(event, automation);
    const channel = automation.destination.value;
    const token = org?.integrations?.slack?.accessToken;
    if (channel && message && token) {
        await publishMessage(message, channel, token);
    }
};