import axios from 'axios';
import { Router } from 'express';
import { Client } from '@notionhq/client';
import { ISDEV } from '../../helpers/environment';
import Org from '../../models/Org';
import { track } from '../../services/segment';
import { getNotionTitle } from '../../services/notion';
import { importDocsFromNotion } from '../../helpers/routes/docs';
import { SearchResponse } from '@notionhq/client/build/src/api-endpoints';

export type NotionPage = {
  id: string;
  title: string;
  lastEditedTime: string;
  icon?: {
    type: string;
    emoji?: string;
    file?: string;
  };
  url: string;
};

type NotionAuthResponse = {
  access_token: string;
  bot_id: string;
  workspace_name: string;
  workspace_icon: string;
  workspace_id: string;
};

type NotionAuthData = {
  response?: NotionAuthResponse;
  error?: string;
};

const clientId = 'ec770c41-07f8-44bd-a4d8-66d30e9786c8';
const redirectUrl = ISDEV ? 'https://connect.mintlify.com/routes/integrations/notion/authorization/local' : 'https://connect.mintlify.com/routes/integrations/notion/authorization';

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
};

const getNotionAccessTokenFromCode = async (code: string): Promise<NotionAuthData> => {
  const token = `${clientId}:${process.env.NOTION_OAUTH_SECRET}`;
  const encodedToken = Buffer.from(token, 'utf8').toString('base64');

  try {
    const { data }: { data: NotionAuthResponse } = await axios.post(
      'https://api.notion.com/v1/oauth/token',
      { grant_type: 'authorization_code', code, redirect_uri: redirectUrl },
      { headers: { Authorization: `Basic ${encodedToken}` } }
    );
    return { response: data };
  } catch (error: any) {
    return { error };
  }
};

const notionRouter = Router();

notionRouter.get('/install', (req, res) => {
  const { org, close, userId } = req.query;
  if (!org) {
    return res.send('Organization ID is required');
  }

  const state = { org, close, userId };
  const encodedState = encodeURIComponent(JSON.stringify(state));
  const url = getNotionInstallURL(encodedState);
  return res.redirect(url);
});

notionRouter.get('/authorization', async (req, res) => {
  const { code, state } = req.query;
  if (code == null) return res.status(403).send('Invalid or missing grant code');

  const { response, error } = await getNotionAccessTokenFromCode(code as string);
  if (error) return res.status(403).send('Invalid grant code');
  if (state == null) return res.status(403).send('No state provided');
  const parsedState = JSON.parse(decodeURIComponent(state as string));
  const { org: orgId, userId } = parsedState;
  const org = await Org.findByIdAndUpdate(orgId, { 'integrations.notion': { ...response } });

  if (org == null) {
    return res.status(403).send({ error: 'Invalid organization ID' });
  }

  if (!response?.access_token) {
    return res.status(403).send({ error: 'No access token' });
  }

  const notionPages = await getNotionDocs(response?.access_token);
  await importDocsFromNotion(notionPages, org, userId);
  track(org._id.toString(), 'Install Notion Integration', {
    isOrg: true,
  });

  if (parsedState?.close) {
    return res.send("<script>window.close();</script>");
  }
  if (ISDEV) {
    return res.redirect(org.subdomain);
  }
  return res.redirect(`https://${org.subdomain}.mintlify.com`);
});


export const getNotionDocs = async (notionAccessToken: string) => {
  if (notionAccessToken == null) {
    throw 'No access to Notion';
  }

  const notion = new Client({ auth: notionAccessToken });
  let isCompletedScan: boolean = false;
  let nextCursor: string | null = null;
  const accumulatedSearchResults: any[] = [];
  while (!isCompletedScan) {    
    try {
      const searchResults: SearchResponse = await notion.search({
        page_size: 100,
        filter: {
          property: 'object',
          value: 'page',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
        start_cursor: nextCursor || undefined,
      });
      accumulatedSearchResults.push(...searchResults.results);
      if (searchResults.has_more) {
        nextCursor = searchResults.next_cursor;
      }
      else {
        isCompletedScan = true;
      }
    } catch {
      isCompletedScan = true;
    }
  }

    const results: NotionPage[] = accumulatedSearchResults
      .map((page: any) => { 
        return {
          id: page.id,
          title: getNotionTitle(page),
          lastEditedTime: page.last_edited_time,
          icon: page.icon?.url,
          url: page.url,
        };
      })

    return results;
}

notionRouter.get('/authorization/local', (req, res) => {
  const { code, state } = req.query;
  return res.redirect(`http://localhost:5000/routes/integrations/notion/authorization?code=${code}&state=${state}`)
})

export default notionRouter;
