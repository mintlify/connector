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
    const { files, owner, repo, branch, summary } : { files: GitbookFile[], owner: string, repo: string, branch: string, summary: GitbookFile } = req.body;
    if (files == null) return res.status(400).end();

    const authConnector = await getAuthConnector(owner);
    const prunedFiles = files.filter((file) => file != null);

    const mdFiles: GitbookFile[] = filesToMdFiles(prunedFiles, repo, branch, authConnector, summary);
    return res.status(200).send({
        files: mdFiles
    });
});

gitbookRouter.post('/update', async (req, res) => {
    // TODO: Properly update summary.md file
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
        const newFiles: GitbookFile[] = req.body?.newFiles;
        if (newFiles != null) {
            const { owner, repo, branch, summary } : { owner: string, repo: string, branch: string, summary: GitbookFile } = req.body;
            const authConnector = await getAuthConnector(owner);
            const newMdFiles: GitbookFile[] = filesToMdFiles(newFiles, repo, branch, authConnector, summary);
            return res.status(200).send({
                files: updatedMdFiles.concat(newMdFiles)
            });
        }
        return res.status(200).send({
            files: updatedMdFiles
        });
    }
});

export default gitbookRouter;
