import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const channelName = 'docs';


export const publishMessage = async (text: string) => {
  const slackToken = process.env.SLACK_TOKEN;
  if (slackToken == null ) return;
  const postMessage = async () => {
    const messageUrl = 'https://slack.com/api/chat.postMessage';
    return await axios.post(messageUrl, {
      channel: `#${channelName}`,
      text
    }, { headers: { authorization: `Bearer ${slackToken}` } });
  }
  const handleChannelNotFound = async (err: string) => {
    if (err === 'channel_not_found') {
      const url = 'https://slack.com/api/conversations.create';
      await axios.post(url, {
        name: channelName
      }, { headers: { authorization: `Bearer ${slackToken}` } });
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


