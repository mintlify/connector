import axios from 'axios';
import { Probot } from 'probot';
import { ACCEPTED_LANGUAGES, ENDPOINT, ADMIN_LOGIN } from '../../constants';

import { getFileExtension, GitbookFile, gitbookFilesToTrees } from './installation';

const isRelevantMdFile = (filename: string): boolean => {
    const relevantPathRegex = filename.match(/mintlify\/.+\.md/);
    return relevantPathRegex != null && relevantPathRegex.length > 0;
};

const getCodeFileName = (mdName: string): string => {
    return mdName.substring(10).slice(-3);
};

const getMdFileEquiv = (codeFilename: string): string => {
    return `mintlify/${codeFilename}.md`;
};

const createFilePairs = (codeContent: (GitbookFile|null)[], mdContent: (GitbookFile|null)[]): ({md: GitbookFile|null, code: GitbookFile|null} | null)[] => {
    return codeContent.map((code, i) => {
        if (codeContent == null || mdContent == null) return null;
        return {
            md: mdContent[i],
            code
        }
    }).filter((pair) => pair != null);
};

export const gitbookUpdates = (app: Probot) => {
    app.on('push', async (context) => {
        const owner = context.payload.repository.owner.name;
        const repo = context.payload.repository.name;
        if (owner == null) return;
        const defaultBranch = context.payload.repository.default_branch;
        const { ref } = context.payload;
        const currBranch = ref.slice(ref.lastIndexOf('/') + 1);
        if (currBranch !== defaultBranch) return; // this might need to change
        const sender = context.payload.sender.login;
        const sha = context.payload.after;
        const headCommit: any = context.payload.head_commit;

        const createFileContentPromises = (filenames: string[]): Promise<GitbookFile | null>[] => {
            return filenames.map((filename: string) => new Promise(async (resolve) => {
                try {
                    const fileExtension = getFileExtension(filename);
                    if (!ACCEPTED_LANGUAGES.includes(fileExtension)) {
                        resolve(null);
                    }
                    const contentRequest = {
                      owner,
                      repo,
                      path: filename
                    };
                    const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };
                    const contentString = Buffer.from(content.data.content, 'base64').toString();
                    resolve({
                      filename,
                      content: contentString
                    });
                  } catch {
                    resolve(null);
                  }
            }));
        };

        const pushChanges = async (files: GitbookFile[], message: string) => {
            const treeChildren = gitbookFilesToTrees(files);
            if (treeChildren.length === 0) return;
            const createdTreeResponse = await context.octokit.rest.git.createTree({
                owner,
                repo,
                tree: treeChildren,
                base_tree: sha
            });
            const treeSha = createdTreeResponse.data.sha;
            const commitResponse = await context.octokit.rest.git.createCommit({
                owner,
                repo,
                message,
                tree: treeSha,
                parents: [sha]
              });
            const commitSha = commitResponse.data.sha;
            await context.octokit.rest.git.updateRef({
                owner,
                repo,
                ref: `heads/${defaultBranch}`,
                sha: commitSha
            });
        };
        if (sender === ADMIN_LOGIN) {
            return;
        } else if (sender === 'gitbook-com[bot]') {
            const changedFilenames: string[] = headCommit?.modified;
            if (changedFilenames == null) return;
            const relevantMdFilenames = changedFilenames.filter((filename) => isRelevantMdFile(filename));
            const codeFilenames = relevantMdFilenames.map((mdFilename) => getCodeFileName(mdFilename));

            const mdFileContentPromises = createFileContentPromises(relevantMdFilenames);
            const codeFileContentPromises = createFileContentPromises(codeFilenames);
            const pairPromises = mdFileContentPromises.concat(codeFileContentPromises);
            const summaryPromise = createFileContentPromises(['SUMMARY.md']);
            const fileContentResponse = await Promise.all(pairPromises.concat(summaryPromise)) as GitbookFile[];
            const mdContent = fileContentResponse.slice(0, mdFileContentPromises.length);
            const codeContent = fileContentResponse.slice(mdFileContentPromises.length, fileContentResponse.length - 1);
            const summary = fileContentResponse[fileContentResponse.length - 1];
            const filePairs = createFilePairs(codeContent, mdContent);
            const gitbookUpdateResponse = await axios.post(`${ENDPOINT}/gitbook/update`, {
                filePairs,
                mdToCode: true,
                owner,
                repo,
                branch: currBranch,
                summary
            });
            const updatedFiles: GitbookFile[] = gitbookUpdateResponse.data.files;
            await pushChanges(updatedFiles, 'Sync docstrings with gitbook updates');
        } else { // if code is updated...
            // get code file & existing md file
            const modifiedFilenames: string[] = headCommit?.modified.filter((filename: any) => !isRelevantMdFile(filename)); // TODO - if md was edited, edit the other way around
            const equivMdFilenames: string[] = modifiedFilenames.map((codeFilename) => getMdFileEquiv(codeFilename));
            const newFilenames: string[] = headCommit?.added;
            if (modifiedFilenames.length === 0 && newFilenames.length === 0) return;
            const filePromises = [...createFileContentPromises(modifiedFilenames), ...createFileContentPromises(equivMdFilenames), ...createFileContentPromises(newFilenames), ...createFileContentPromises(['SUMMARY.md'])];
            const fileResponses = await Promise.all(filePromises);

            const codeContent = fileResponses.slice(0, modifiedFilenames.length);
            const mdContent = fileResponses.slice(modifiedFilenames.length, modifiedFilenames.length + equivMdFilenames.length);
            const filePairs = createFilePairs(codeContent, mdContent);
            const summary = fileResponses[fileResponses.length - 1];
            const newFileContent = fileResponses.slice(modifiedFilenames.length + equivMdFilenames.length, filePromises.length - 1);
            const gitbookUpdateResponse = await axios.post(`${ENDPOINT}/gitbook/update`, {
                filePairs,
                mdToCode: false,
                newFiles: newFileContent,
                owner,
                repo,
                branch: currBranch,
                summary
            });
            const updatedFiles: GitbookFile[] = gitbookUpdateResponse.data.files;
            await pushChanges(updatedFiles, 'Sync markdown files with code updates');
        }
    });
}