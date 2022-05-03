import { Probot } from 'probot';
import axios from 'axios';

import { ENDPOINT, ACCEPTED_LANGUAGES } from "../../constants";

export type GitbookFile = {
  filename: string;
  content: string;
}

type Tree = {
  path?: string | undefined;
  mode?: "100644" | "100755" | "040000" | "160000" | "120000" | undefined;
  type?: "blob" | "tree" | "commit" | undefined;
  sha?: string | null | undefined;
  content?: string | undefined;
}

export const getFileExtension = (filename: string): string => {
  const fileExtensionRegex = /(?:\.([^.]+))?$/;
  const regexExec = fileExtensionRegex.exec(filename);
  if (regexExec == null) return '';
  const fileExtension = regexExec[1];
  return fileExtension;
}

export const gitbookFilesToTrees = (gitbookFiles: GitbookFile[]): Tree[] => {
  return gitbookFiles.map((gbFile) => {
    return {
      path: gbFile.filename,
      mode: '100644',
      type: 'blob',
      content: gbFile.content
    };
  });
};

const installation = async (context: any, repo: string) => {
    const owner = context.payload.installation.account.login;
    const integrationsResponse = await axios.get(`${ENDPOINT}/v01/integrations`, {
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
      });
      const { tree } = contentResponse.data;
      const fileContentPromises = tree.map((file: any) => new Promise(async (resolve) => {
        if (file.mode !== '100644') { // skip anything that isn't a file in the tree
          resolve(null)
        }
        const fileExtension = getFileExtension(file.path);
        if (!ACCEPTED_LANGUAGES.includes(fileExtension)) {
          resolve(null);
        }
        try {
          const contentRequest = {
            owner,
            repo,
            path: file.path 
          };
          const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };
          const contentString = Buffer.from(content.data.content, 'base64').toString();
          resolve({
            filename: file.path,
            content: contentString
          });
        } catch {
          resolve(null)
        }
      }));
      const fileResponses = await Promise.all(fileContentPromises);
      // TODO: account for when SUMMARY.md is named differently or doesn't exist
      const files = fileResponses.filter((file) => file != null && file.filename !== 'SUMMARY.md');
      const summary = fileResponses.find((file) => file.filename === 'SUMMARY.md');
      const gitbookFileResponse = await axios.post(`${ENDPOINT}/gitbook/installation`, {
        files,
        owner,
        branch: defaultBranch,
        repo,
        summary
      });
      const gitbookFiles = gitbookFileResponse.data.files as GitbookFile[];
      const treeChildren = gitbookFilesToTrees(gitbookFiles);
      const refResponse = await context.octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`
      });
      const baseSha = refResponse.data.object.sha;
      const createdTreeResponse = await context.octokit.rest.git.createTree({
        owner,
        repo,
        tree: treeChildren,
        base_tree: baseSha
      });
      const treeSha = createdTreeResponse.data.sha;
      const commitResponse = await context.octokit.rest.git.createCommit({
        owner,
        repo,
        message: 'Initial docs generated',
        tree: treeSha,
        parents: [baseSha]
      });
      const commitSha = commitResponse.data.sha;
      await context.octokit.rest.git.updateRef({
        owner,
        repo,
        ref: `heads/${defaultBranch}`,
        sha: commitSha
      });
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