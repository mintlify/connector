import axios from 'axios';
import dotenv from 'dotenv';
import qs from 'qs';

dotenv.config();

const channelName = 'docs';
const clientId = '2329388587911.3498023797925';
const redirectUri = 'https://connect.mintlify.com/routes/integrations/slack/authorization';

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

export const getSlackAuthUrl = (state?: string) => {
  const url = new URL('https://slack.com/oauth/v2/authorize');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('scope', 'incoming-webhook,channels:manage,channels:read,chat:write,chat:write.customize,chat:write.public');
  if (state) {
    url.searchParams.append('state', state);
}
  return url.toString();
};

export const getSlackAccessTokenFromCode = async (code: string): Promise<any> => {
  try {
    console.log({code});
    const url = 'https://slack.com/api/oauth.v2.access';
    const response = await axios.post(url,
      qs.stringify({
        client_id: clientId,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code
      })
    );
    console.log({response});
    return { response }
  } catch (error: any) {
    return { error };
  }
  
}
