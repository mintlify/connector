import express from 'express';

import { mdToFileSkeleton } from './markdown';
import { getAuthConnector } from 'routes/v01';
import { FileSkeleton } from 'parsing/types';
import { filesToMdFiles, updateCodeFile, updateMdFile } from './helpers';

export type GitbookFile = {
    filename: string;
    content: string;
    fileSkeleton?: FileSkeleton;
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

    const mdFiles: GitbookFile[] = filesToMdFiles(prunedFiles, repo, branch, summary, authConnector);
    return res.status(200).send({
        files: mdFiles
    });
});

gitbookRouter.post('/update', async (req, res) => {
    const { filePairs, mdToCode } : { filePairs: FilePair[], mdToCode: boolean} = req.body;
    if (filePairs == null) return res.status(400).end();
    const filePairsWithSkeletons: FilePair[] = filePairs.map((pairs) => {
        const md = {
            ...pairs.md,
            fileSkeleton: mdToFileSkeleton(pairs.md)
        };
        const code = {
            ...pairs.code,
            fileSkeleton: mdToFileSkeleton(pairs.code)
        }
        return {
            md,
            code
        };
    });
    if (mdToCode) {
        const updatedCodeFiles: GitbookFile[] = filePairsWithSkeletons.map((filePair) => updateCodeFile(filePair));
        return res.status(200).send({
            files: updatedCodeFiles
        });
    } else {
        const updatedMdFiles: GitbookFile[] = filePairsWithSkeletons.map((filePair) => updateMdFile(filePair));
        return res.status(200).send({
            files: updatedMdFiles
        });
    }
});

export default gitbookRouter;
