import express from 'express';

import { getLanguageIdByFilename } from 'parsing/filenames';
import { formatCode, getFileSkeleton } from 'parsing';
import { fileSkeletonToMarkdown } from './markdown';
import { getAuthConnector } from 'routes/v01';
import { addUrlsToSkeletons } from './url';

export type GitbookFile = {
    filename: string;
    content: string;
}

const gitbookRouter = express.Router();

gitbookRouter.post('/', async (req, res) => {
    const { files, owner } : { files: GitbookFile[], owner: string } = req.body;

    if (files == null) return res.status(400).end();
    if (owner == null) return res.status(400).end();
    if (files === []) return res.status(200).end();

    const authConnector = await getAuthConnector(owner);

    const mdFiles: GitbookFile[] = [];
    files.forEach(async (file) => {
        const languageId = getLanguageIdByFilename(file.filename);
        const content = formatCode(languageId, file.content);
        const fileSkeleton = getFileSkeleton(content, languageId);
        fileSkeleton.skeletons = addUrlsToSkeletons(fileSkeleton.skeletons, file.filename, authConnector);
        const markdown = fileSkeletonToMarkdown(fileSkeleton, file.filename);
        const mdFilename = `mintlify/${file.filename}.md`
        const mdFile = { filename: mdFilename, content: markdown };
        mdFiles.push(mdFile);
    });
    return res.status(200).send({
        mdFiles
    });
});

export default gitbookRouter;
