import { Router } from 'express';
import queryString from 'query-string';
import { ISDEV } from '../helpers/github/octokit';
import Org from '../models/Org';
import { getGitHubAccessTokenFromCode, getGitHubInstallations, GitHubAuthResponse } from '../services/github';
import { getNotionAccessTokenFromCode, getNotionInstallURL } from '../services/notion';
import { getSlackAccessTokenFromCode, getSlackAuthUrl } from '../services/slack';

const integrationsRouter = Router();

integrationsRouter.get('/github/install', (req, res) => {
  const { org } = req.query;
  if (!org) {
    return res.send('Organization ID is required');
  }

  const state = { org }
  const encodedState = encodeURIComponent(JSON.stringify(state));
  const installationURL = ISDEV ? 'https://github.com/apps/mintlify-dev/installations/new' : 'https://github.com/apps/mintlify/installations/new';
  const urlParsed = new URL(installationURL);
  urlParsed.searchParams.append('state', encodedState);
  const url = urlParsed.toString();
  return res.redirect(url);
})

integrationsRouter.get('/github/authorization', async (req, res) => {
  const { code, state } = req.query;
  if (code == null) return res.status(403).send('Invalid or missing grant code');
  if (state == null) return res.status(403).send('No state provided');
  const parsedState = JSON.parse(decodeURIComponent(state as string));

  const { response: rawResponse, error } = await getGitHubAccessTokenFromCode(code as string, parsedState);
  if (error || !rawResponse) return res.status(403).send('Invalid grant code');
  
  const { org } = parsedState;
  const response = queryString.parse(rawResponse) as unknown as GitHubAuthResponse;
  const { access_token } = response;

  const installations = await getGitHubInstallations(access_token);

  await Org.findByIdAndUpdate(org, { "integrations.github": { ...response, installations }})
  return res.redirect('https://github.com');
});

integrationsRouter.get('/notion/install', (req, res) => {
  const { org } = req.query;
  if (!org) {
    return res.send('Organization ID is required');
  }

  const state = { org }

  const encodedState = encodeURIComponent(JSON.stringify(state));
  const url = getNotionInstallURL(encodedState);
  return res.redirect(url);
});

integrationsRouter.get('/notion/authorization', async (req, res) => {
  const { code, state } = req.query;
  if (code == null) return res.status(403).send('Invalid or missing grant code');

  const { response, error } = await getNotionAccessTokenFromCode(code as string);

  if (error) return res.status(403).send('Invalid grant code')
  if (state == null) return res.status(403).send('No state provided');

  const  { org } = JSON.parse(decodeURIComponent(state as string));
  await Org.findByIdAndUpdate(org, { "integrations.notion": { ...response } })
  return res.redirect('https://notion.so');
});

integrationsRouter.get('/slack/install', async (req, res) => {
  const { org } = req.query;
  if (!org) {
      return res.send('Organization ID is required');
  }

  const state = { org };

  const encodedState = encodeURIComponent(JSON.stringify(state));
  const url = getSlackAuthUrl(encodedState);
  return res.redirect(url);
});

integrationsRouter.get('/slack/authorization', async (req, res) => {
  const { code, state } = req.query;
  console.log(req.query);
  if (code == null) return res.status(403).send('Invalid or missing grant code');

  const { response, error } = await getSlackAccessTokenFromCode(code as string);
  console.log({response});

  if (error) return res.status(403).send('Invalid grant code');
  if ( state == null) return res.status(403).send('No state provided');

  const { org } = JSON.parse(decodeURIComponent(state as string));
  const accessToken = response.data.access_token;
  await Org.findByIdAndUpdate(org, {
      "integration.slack.accessToken": accessToken
  });
  return res.redirect('slack://open');
});

export default integrationsRouter;