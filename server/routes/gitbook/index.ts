import express from 'express';

import { getLanguageIdByFilename } from 'parsing/filenames';
import { formatCode, getFileSkeleton } from 'parsing';
import { fileSkeletonToMarkdown, summaryUpdateOnInstallation } from './markdown';
import { getAuthConnector } from 'routes/v01';
import { addUrlsToSkeletons } from './url';

const SUPPORTED_LANGUAGES = ['typescript'];

export type GitbookFile = {
    filename: string;
    content: string;
}

export type FilePair = {
    md: GitbookFile;
    code: GitbookFile;
}

const gitbookRouter = express.Router();

gitbookRouter.post('/installation', async (req, res) => {
    const { files, owner, branch, repo, summary } : { files: GitbookFile[], owner: string, branch: string, repo: string, summary: GitbookFile } = req.body;
    if (files == null) return res.status(400).end();

    const authConnector = await getAuthConnector(owner);
    const prunedFiles = files.filter((file) => file != null);

    const mdFiles: GitbookFile[] = [];
    prunedFiles.forEach(async (file) => {
        const languageId = getLanguageIdByFilename(file.filename);
        if (!SUPPORTED_LANGUAGES.includes(languageId)) return;
        const content = formatCode(languageId, file.content);
        const fileSkeleton = getFileSkeleton(content, languageId);
        fileSkeleton.skeletons = addUrlsToSkeletons(fileSkeleton.skeletons, repo, branch, file.filename, authConnector);
        fileSkeleton.skeletons = fileSkeleton.skeletons.map((skeleton) => { return { ...skeleton, filename: file.filename };});
        const markdown = fileSkeletonToMarkdown(fileSkeleton);
        const mdFilename = `mintlify/${file.filename}.md`
        const mdFile = { filename: mdFilename, content: markdown };
        mdFiles.push(mdFile);
    });
    mdFiles.push(summaryUpdateOnInstallation(summary, mdFiles));
    return res.status(200).send({
        mdFiles
    });
});

gitbookRouter.post('/update', async (req, res) => {
    const { filePairs, direction } : { filePairs: FilePair[], direction: string } = req.body;
    if (filePairs == null) return res.status(400).end();
    if (direction === 'mdToCode') {
        // parse md
    } else if (direction === 'codeToMd') {
        // MVP just regenerate md files
    }
});

export default gitbookRouter;
