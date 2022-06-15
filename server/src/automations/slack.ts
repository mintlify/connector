import axios from 'axios';
import dotenv from 'dotenv';
import { EventType } from '../models/Event';
import { DocType } from '../models/Doc';
import { OrgType } from '../models/Org';
import Code, { CodeType } from '../models/Code';
import { getDataFromWebpage } from '../services/webscraper';

dotenv.config();

const formatUrl = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}

export const publishMessage = async (text: string, channel: string, token: string, url: string) => {
  const postMessage = async () => {
    const messageUrl = 'https://slack.com/api/chat.postMessage';
    let formattedChannel = channel;
    if (channel.charAt(0) !== '#') {
      formattedChannel = `#${channel}`;
    }
    const formattedUrl = formatUrl(url);
    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "View"
          },
          url: formattedUrl,
          action_id: "button"
        }
      }
    ];
    return await axios.post(messageUrl, {
      channel: formattedChannel,
      blocks,
      text
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

const getSlackMessage = async (event: EventType, orgId: string, doc: DocType): Promise<string|null> => {
  let title = 'your document';
  if (doc != null) {
    const { title: pageTitle } = await getDataFromWebpage(doc.url, orgId);
    title = pageTitle;
  }
  if (event.type === 'change') {
    return `Changes have been made to <${doc?.url}|${title}>`;
  } else if (event.type === 'code') {
    const code: CodeType | null = await Code.findById(event.code);

    return `Changes have been made to <${code?.url}|code> connected to <${doc?.url}|${title}>. Do you need to update your document to reflect the changes?`;
  }
  return null;
}

export const slackAutomationForEvent = async (event: EventType, org: OrgType, doc: DocType) => {
    const message = await getSlackMessage(event, org._id.toString(), doc);
    const token = org?.integrations?.slack?.accessToken;
    if (message && token) {
        await publishMessage(message, 'docs', token, doc.url);
    }
};