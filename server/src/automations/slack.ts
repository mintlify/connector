import dotenv from 'dotenv';
import { EventType } from '../models/Event';
import { DocType } from '../models/Doc';
import { OrgType } from '../models/Org';
import Code, { CodeType } from '../models/Code';
import { getDataFromWebpage } from '../services/webscraper';
import { App } from '@slack/bolt';
dotenv.config();

const formatUrl = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url;
  }
  return url;
}

const signingSecret = process.env.SLACK_SIGNING_SECRET || '';

export const publishMessage = async (text: string, channel: string, token: string, url: string) => {
  if (!process.env.SLACK_SIGNING_SECRET) {
    return;
  }
  const slackApp =  new App({token, signingSecret})
  const postMessage = async () => {
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
    return await slackApp.client.chat.postMessage( {
      channel: formattedChannel,
      blocks,
      text,
      mrkdwn: true
    });
  }
  const handleChannelNotFound = async (err: string) => {
    if (err === 'channel_not_found') {
      await slackApp.client.admin.conversations.create({
        name: channel,
        is_private: false
      });
      await postMessage();
    }
  }
  try {
    const res = await postMessage() as any;
    await handleChannelNotFound(res?.data?.error);
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