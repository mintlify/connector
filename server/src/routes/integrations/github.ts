import axios from "axios";
import { Router } from 'express';
import queryString from 'query-string';

import { ENDPOINT, ISDEV } from "../../helpers/github/octokit"
import Org from '../../models/Org';

type GitHubAuthResponse = {
  access_token: string,
  expires_in: number,
  refresh_token: string,
  refresh_token_expires_in: number,
  scope: string,
  token_type: string
}

type GitHubAuthData = {
  response?: string,
  error?: string
}

const githubRedirectUrl = `${ENDPOINT}/routes/integrations/github/authorization`;

const getGitHubAccessTokenFromCode = async (code: string, state: Object): Promise<GitHubAuthData> => {
  try {
    const { data }: { data: string } = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: githubRedirectUrl,
      state,
    });
    return { response: data }
  }
  catch (error: any) {
    return { error };
  }
}

const getGitHubInstallations = async (accessToken: string) => {
  try {
    const { data: { installations } }: { data: { installations: Object[] } }  = await axios.get('https://api.github.com/user/installations', {
      headers: {
        'Authorization': `token ${accessToken}`
      }
    })

    return installations
  } catch (error: any) {
    return []
  }
}

const getInstallationRepositories = async (accessToken: string, installations: any[]) => {
  try {
    const getInstalledRepoPromises = installations.map((installation) => {
      return axios.get(`https://api.github.com/user/installations/${installation.id}/repositories`, {
        headers: {
          'Authorization': `token ${accessToken}`
        }
      });
    });

    const installedReposRes = await Promise.all(getInstalledRepoPromises);
    const installedRepos = installedReposRes.map(({ data: { repositories } }) => {
      return repositories;
    });

    return installedRepos;

  } catch (error: any) {
    return []
  }
}

const githubRouter = Router();

githubRouter.get('/install', (req, res) => {
  try {
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
  } catch (error) {
    return res.status(500).send({error});
  }
    
});
  
githubRouter.get('/authorization', async (req, res) => {
  try {
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
    const repositories = await getInstallationRepositories(access_token, installations);
    const installationsWithRepositories = installations.map((installation, i) => {
      return {
        ...installation,
        repositories: repositories[i]
      }
    })
  
    await Org.findByIdAndUpdate(org, { "integrations.github": { ...response, installations: installationsWithRepositories }})
    return res.redirect('https://github.com');
  } catch (error) {
    return res.status(500).send({error});
  }
    
});

export default githubRouter;
