import axios from 'axios';
import { Probot } from 'probot';
import { ENDPOINT } from '../constants';

import { GitbookFile } from './installation';

const isRelevantFile = (filename: string): boolean => {
    const relevantPathRegex = filename.match(/mintlify\/.+\.md/);
    return relevantPathRegex != null && relevantPathRegex.length > 0;
}

const getCodeFileName = (mdName: string): string => {
    return mdName.substring(10).slice(-3);
}

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
        if (sender === 'gitbook-com[bot]') {
            const headCommit: any = context.payload.head_commit;
            const changedFilenames: string[] = headCommit?.modified;
            if (changedFilenames == null) return;
            const relevantMdFilenames = changedFilenames.filter((filename) => isRelevantFile(filename));
            const codeFilenames = relevantMdFilenames.map((mdFilename) => getCodeFileName(mdFilename));

            const createFileContentPromises = (filenames: string[]): Promise<GitbookFile | null>[] => {
                return filenames.map((filename: string) => new Promise(async (resolve) => {
                    try {
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
                        resolve(null)
                      }
                }))
            }

            const mdFileContentPromises = createFileContentPromises(relevantMdFilenames);
            const codeFileContentPromises = createFileContentPromises(codeFilenames);
            const fileContentResponse = await Promise.all(mdFileContentPromises.concat(codeFileContentPromises)) as GitbookFile[];
            const mdContent = fileContentResponse.slice(0, mdFileContentPromises.length);
            const codeContent = fileContentResponse.slice(mdFileContentPromises.length);
            const filePairs = codeContent.map((code, i) => {
                if (codeContent == null || mdContent == null) return;
                return {
                    md: mdContent[i],
                    code
                }
            }).filter((pair) => pair != null);
            const gitbookUpdateResponse = await axios.post(`${ENDPOINT}/gitbook/update`, {
                filePairs,
                mdToCode: true
            });
            console.log(gitbookUpdateResponse);
            // update code files from here
        } else { // if code is updated...
            // get code file & existing md file
            // update md file
        }
    });
}