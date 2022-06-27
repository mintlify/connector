import axios from 'axios';
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { Router } from 'express';
import { ISDEV } from '../../helpers/environment';
import { removeHtmlTagsAndGetText } from '../../helpers/routes/domparsing';
import Org from '../../models/Org';
import { ContentData } from '../../services/webscraper';
import { importDocsFromConfluence, updateImportStatus } from '../../helpers/routes/docs';

export type ConfluencePage = {
  id: string;
  status: string;
  type: 'page';
  title: string;
  content: string;
  history: {
    createdDate: string;
    lastUpdated: {
      when: string;
    }
  },
  _links: {
    webui: string;
  },
  body: {
    view: {
      value: string;
    }
  }
}

export type ConfluenceCredentials = {
  access_token: string,
  expires_in: string,
  refresh_token: string,
  scope: string,
  accessibleResources: {
    id: string,
    url: string,
    name: string,
    scopes: string[],
    avatarUrl: string
  }[]
}

const confluenceRouter = Router();
const clientId = process.env.CONFLUENCE_CLIENT_ID;
const clientSecret = process.env.CONFLUENCE_CLIENT_SECRET;
const redirectUri = ISDEV
  ? 'http://localhost:5000/routes/integrations/confluence/authorization'
  : 'https://connect.mintlify.com/routes/integrations/confluence/authorization'

confluenceRouter.get('/install', async (req, res) => {
  const { org, close, userId } = req.query;
  if (!org) return res.status(404).send('Organization ID is required');

  const state = { org, close, userId };
  const encodedState = encodeURIComponent(JSON.stringify(state));

  const confluenceAuthUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=read%3Aconfluence-user%20read%3Aconfluence-content.summary%20read%3Aconfluence-content.all%20offline_access&redirect_uri=${redirectUri}&state=${encodedState}&response_type=code&prompt=consent`;
  return res.redirect(confluenceAuthUrl);
});

confluenceRouter.get('/authorization', async (req, res) => {
    const { code, state } = req.query;
    if (code == null) return res.status(403).send('Invalid or missing grant code');
    if (state == null) return res.status(403).send('No state provided');

    try {
      const { data: { access_token, expires_in, scope, refresh_token } } = await axios.post('https://auth.atlassian.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      });

      const { data: accessibleResources } = await axios.get('https://api.atlassian.com/oauth/token/accessible-resources', {
        headers:{ 
          'Authorization': `Bearer ${access_token}`,
          'Accept': 'application/json'
        }
      });

      const parsedState = JSON.parse(decodeURIComponent(state as string));
      const { org: orgId, userId } = parsedState;
      const org = await Org.findByIdAndUpdate(orgId, {
        'integrations.confluence': {
          access_token,
          expires_in,
          refresh_token,
          scope,
          accessibleResources
        },
      });

      if (org == null) {
        return res.status(403).send({ error: 'Invalid organization ID' });
      }

      const redirectUrl: string = `https://${org.subdomain}.mintlify.com`;

      try {
        const cloudId = accessibleResources[0].id;
        const { data: response } = await axios.get(`https://api.atlassian.com/ex/confluence/${cloudId}/wiki/rest/api/content`, {
          headers: { 
            'Authorization': `Bearer ${access_token}`,
            'Accept': 'application/json'
          },
          params: {
            expand: ['body.view', 'history.lastUpdated'].join(','),
          },
        });

        const results = response.results.map((result: ConfluencePage) => {
          return {
            ...result,
            content: NodeHtmlMarkdown.translate(result.body.view.value)
          }
        });

        importDocsFromConfluence(results, org, userId)
      
        if (parsedState?.close) {
          return res.send("<script>window.close();</script>");
        }
        if (ISDEV) {
          return res.redirect('http://localhost:3000');
        }
        return res.redirect(redirectUrl);
      } catch {
        // When getting content fails
        await updateImportStatus(orgId, 'confluence', false);
        return res.redirect(redirectUrl);
      }
    } catch {
      return res.status(500).send("Unable to install Confluence integration. Refresh to try again")
    }
});

export const getConfluenceContentFromPageById = async (pageId: string, confluenceCredentials: ConfluenceCredentials): Promise<ContentData> => {
  const { data: response }: { data: ConfluencePage } = await axios.get(`https://api.atlassian.com/ex/confluence/${confluenceCredentials.accessibleResources[0].id}/wiki/rest/api/content/${pageId}`, {
      headers: { 
        'Authorization': `Bearer ${confluenceCredentials.access_token}`,
        'Accept': 'application/json'
      },
      params: {
        expand: ['body.view', 'history.lastUpdated'].join(','),
      },
    });
  
    return {
      method: 'confluence-private',
      title: response.title,
      content: removeHtmlTagsAndGetText(response.body.view.value),
    }
}

export default confluenceRouter;
