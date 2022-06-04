import axios from 'axios';
import { Router } from 'express';
import { ISDEV } from '../../helpers/environment';

import { ENDPOINT } from '../../helpers/github/octokit';
import Org from '../../models/Org';
import { track } from '../../services/segment';

const clientId = 'ec770c41-07f8-44bd-a4d8-66d30e9786c8';
const redirectUrl = `${ENDPOINT}/routes/integrations/notion/authorization`;

const getNotionInstallURL = (state?: string) => {
    const url = new URL('https://api.notion.com/v1/oauth/authorize');
    url.searchParams.append('owner', 'user');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUrl);
    url.searchParams.append('response_type', 'code');
    if (state) {
        url.searchParams.append('state', state);
    }
    return url.toString();
}

type NotionAuthResponse = {
    access_token: string,
    bot_id: string,
    workspace_name: string,
    workspace_icon: string,
    workspace_id: string,
}

type NotionAuthData = {
    response?: NotionAuthResponse,
    error?: string
}

const getNotionAccessTokenFromCode = async (code: string): Promise<NotionAuthData> => {
    const token = `${clientId}:${process.env.NOTION_OAUTH_SECRET}`;
    const encodedToken = Buffer.from(token, 'utf8').toString('base64');

    try {
        const { data }: { data: NotionAuthResponse } = await axios.post('https://api.notion.com/v1/oauth/token',
            { grant_type: 'authorization_code', code, redirect_uri: redirectUrl },
            { headers: { 'Authorization': `Basic ${encodedToken}` } }
        );
        return { response: data }
    } catch (error: any) {
        return { error }
    }
}

const notionRouter = Router();

notionRouter.get('/install', (req, res) => {
    const { org } = req.query;
    if (!org) {
      return res.send('Organization ID is required');
    }
  
    const state = { org }
  
    const encodedState = encodeURIComponent(JSON.stringify(state));
    const url = getNotionInstallURL(encodedState);
    return res.redirect(url);
  });
  
  notionRouter.get('/authorization', async (req, res) => {
    const { code, state } = req.query;
    if (code == null) return res.status(403).send('Invalid or missing grant code');
  
    const { response, error } = await getNotionAccessTokenFromCode(code as string);
    if (error) return res.status(403).send('Invalid grant code')
    if (state == null) return res.status(403).send('No state provided');
  
    const  { org: orgId } = JSON.parse(decodeURIComponent(state as string));
    const org = await Org.findByIdAndUpdate(orgId, { "integrations.notion": { ...response } });

    if (org == null) {
        return res.status(403).send({ error: 'Invalid organization ID' });
    }

    if (ISDEV) {
        return res.redirect(org.subdomain);
    }

    track(org._id.toString(), 'Install Notion Integration', {
        isOrg: true,
    });

    return res.redirect(`https://${org.subdomain}.mintlify.com`);
});

export default notionRouter;
