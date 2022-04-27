import { Probot } from 'probot';
import axios from 'axios';

import { ENDPOINT } from "../constants";

const installation = async (context: any, repo: string) => {
    const owner = context.payload.installation.account.login;
    const integrationsResponse = await axios.get(`${ENDPOINT}/connect/v01/integrations`, {
      data: {
        owner
      }
    });
    const { gitbook } = integrationsResponse?.data;
    if (gitbook) {
      const repoResponse = await context.octokit.request('GET /repos/{owner}/{repo}', {
        owner,
        repo
      });
      const defaultBranch = repoResponse.data.default_branch;
      const contentResponse = await context.octokit.git.getTree({
        owner,
        repo,
        tree_sha: defaultBranch,
        recursive: true
      })
      const { tree } = contentResponse.data
      console.log(tree);
    }
}

export const gitbookInstallation = (app: Probot) => {
    app.on('installation.created', async (context) => {
        const repo = context.payload.repositories[0]?.name;
        await installation(context, repo);
    });
    app.on('installation_repositories.added', async (context) => {
        const repo = context.payload.repositories_added[0]?.name;
        await installation(context, repo);
    });
}