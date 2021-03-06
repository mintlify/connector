import axios from "axios";
import { Router } from 'express';
import queryString from 'query-string';
import { ISDEV } from "../../helpers/environment";
import { ENDPOINT } from "../../helpers/github/octokit"
import { importDocsFromGitHub, GitHubMarkdown, updateImportStatus } from "../../helpers/routes/docs";
import Org from '../../models/Org';
import { track } from "../../services/segment";

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
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: githubRedirectUrl,
      state,
    });
    return { response: response.data }
  } catch (error) {
    throw error;
  }
  
}

const getGitHubInstallations = async (accessToken: string) => {
  const { data: { installations } }: { data: { installations: any[] } }  = await axios.get('https://api.github.com/user/installations', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
  return installations
}

const getInstallationRepositories = async (accessToken: string, installations: any[]) => {
  const getInstalledRepoPromises = installations.map((installation) => {
    return axios.get(`https://api.github.com/user/installations/${installation.id}/repositories`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  });

  const installedReposRes = await Promise.all(getInstalledRepoPromises);
  const installedRepos = installedReposRes.map(({ data: { repositories } }) => {
    return repositories;
  });

  return installedRepos;
}

const getMarkdowns = async (accessToken: string, org: string, repositories: any[]): Promise<GitHubMarkdown[]> => {
  // Currently does not handle when there are 100+ results
  const { data: readmeResults } = await axios.get(`https://api.github.com/search/code`, {
    params: {
      q: `org:${org} language:markdown`
    },
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  const contentPromises = readmeResults.items.map((result: any) => {
    return new Promise(async (resolve) => {
      try {
        const contentPromise = axios.get(result.url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const commitPromise = axios.get(`https://api.github.com/repos/${org}/${result.repository.name}/commits?path=${result.path}&per_page=1`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const [content, commit] = await Promise.all([contentPromise, commitPromise]);
        const flatRepos = repositories.flat();
        const repo = flatRepos.find((repo) => result.repository.name === repo.name);
        resolve([content, commit, repo]);
      } catch (error) {
        resolve(null);
      }
    })
  });

  const contentResponse = await Promise.all(contentPromises);
  const markdowns: GitHubMarkdown[] = [];
  contentResponse.forEach((response, i) => {
    if (response == null) return;

    const [content, commit, repo] = response;

    if (repo == null) return;

    const contentString = Buffer.from(content.data.content, 'base64').toString();
    const resultFromSearch = readmeResults.items[i];
    markdowns.push({
      url: resultFromSearch.html_url,
      path: readmeResults.items[i].path, // include repo name
      content: contentString,
      repo,
      lastUpdatedAt: commit.data[0].commit.author.date
    })
  });

  return markdowns;
}

const githubRouter = Router();

githubRouter.get('/install', (req, res) => {
  try {
    const { org, close, userId } = req.query;
    if (!org) {
      return res.send('Organization ID is required');
    }
  
    const state = { org, close, userId }
    const encodedState = encodeURIComponent(JSON.stringify(state));
    const installationURL = ISDEV ? 'https://github.com/apps/mintlify-dev/installations/new' : 'https://github.com/apps/mintlify/installations/new';
    const urlParsed = new URL(installationURL);
    urlParsed.searchParams.append('state', encodedState);
    const url = urlParsed.toString();
    return res.redirect(url);
  } catch (error) {
    return res.status(500).send(error);
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
    
    const { org: orgId, userId } = parsedState;
    const response = queryString.parse(rawResponse) as unknown as GitHubAuthResponse;
    const { access_token } = response;
  
    const installations = await getGitHubInstallations(access_token);

    const accountOwner = installations[0].account.login;

    const repositories = await getInstallationRepositories(access_token, installations);
    const markdowns = await getMarkdowns(access_token, accountOwner, repositories);
    const installationsWithRepositories = installations.map((installation, i) => {
      return {
        ...installation,
        repositories: repositories[i]
      }
    });
  
    const org = await Org.findByIdAndUpdate(orgId, { "integrations.github": {
      ...response,
      installations: installationsWithRepositories,
      'importStatus.github': true
    }})
    if (org == null) {
      return res.status(403).send({error: 'Invalid Organization ID'})
    }

    const redirectUrl = `https://${org.subdomain}.mintlify.com`;

    try {
      importDocsFromGitHub(markdowns, org, userId)
      if (ISDEV) {
        return res.redirect(org.subdomain);
      }

      track(org._id.toString(), 'Install GitHub App', {
        isOrg: true,
      });

      if (parsedState?.close) {
        return res.send("<script>window.close();</script>");
      }
      if (ISDEV) {
        return res.redirect('http://localhost:3000');
      }
      return res.redirect(redirectUrl);
    } catch {
      await updateImportStatus(orgId, 'github', false);
      return res.redirect(redirectUrl);
    }
  } catch (error: any) {
    return res.status(500).send(error?.data);
  }
});

export default githubRouter;
