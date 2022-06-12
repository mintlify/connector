import axios from 'axios';
import qs from 'qs';
import { Router } from 'express';

import Org from '../../models/Org';
import { track } from '../../services/segment';

const clientId = '2329388587911.3498023797925';
const redirectUri = 'https://connect.mintlify.com/routes/integrations/slack/authorization';

const getSlackAuthUrl = (state?: string) => {
  const url = new URL('https://slack.com/oauth/v2/authorize');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('scope', 'channels:read,chat:write,chat:write.public,chat:write.customize,channels:manage');
  if (state) {
    url.searchParams.append('state', state);
  }
  return url.toString();
};

const getSlackAccessTokenFromCode = async (code: string): Promise<any> => {
  try {
    const url = 'https://slack.com/api/oauth.v2.access';
    const response = await axios.post(
      url,
      qs.stringify({
        client_id: clientId,
        client_secret: process.env.SLACK_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code,
      })
    );
    return { response };
  } catch (error: any) {
    return { error };
  }
};

const slackRouter = Router();

slackRouter.get('/install', async (req, res) => {
  const { org } = req.query;
  if (!org) {
    return res.send('Organization ID is required');
  }

  const state = { org };

  const encodedState = encodeURIComponent(JSON.stringify(state));
  const url = getSlackAuthUrl(encodedState);
  return res.redirect(url);
});

slackRouter.get('/authorization', async (req, res) => {
  const { code, state } = req.query;
  if (code == null) return res.status(403).send('Invalid or missing grant code');

  const { response, error } = await getSlackAccessTokenFromCode(code as string);
  if (error) return res.status(403).send('Invalid grant code');
  if (state == null) return res.status(403).send('No state provided');
  if (response.data.ok) {
    const { org: orgId } = JSON.parse(decodeURIComponent(state as string));

    const { data } = response;
    const webhookData = data?.incoming_webhook;
    const org = await Org.findByIdAndUpdate(orgId, {
      'integrations.slack': {
        accessToken: data?.access_token,
        appId: data?.app_id,
        team: data?.team,
        channel: webhookData?.channel,
        channelId: webhookData?.channel_id,
        configurationUrl: webhookData?.configuration_url,
      },
    });

    if (org == null) {
      return res.status(403).send({ error: 'Invalid organization ID' });
    }

    track(org._id.toString(), 'Install Slack Integration', {
      isOrg: true,
    });
  }

  return res.send("<script>window.close();</script>");
});

export default slackRouter;
