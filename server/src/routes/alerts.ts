import express from 'express';
import { Alert } from '../helpers/github/types';
import { CodeType } from '../models/Code';
import { codeToAlert, didChange } from '../helpers/routes/alerts';
import { FileInfo } from '../helpers/github/patch';

const alertsRouter = express.Router();

alertsRouter.post('/', async (req, res) => {
    const alertsRequest = req.body;
    const { files, codes } : { files: FileInfo[], codes: CodeType[] } = alertsRequest;

    if (files == null) return res.status(400).end();

    
    if (codes.length === 0) {
        return res.status(200).send({alerts: []});
    }

    const filesWithContent = files.filter((file) => file != null);

    const alertPromises: Promise<Alert|null>[] = [];
    codes.forEach((code: CodeType) => {
        switch (code.type) {
            case 'file':
                filesWithContent.map((file) => {
                    if (file.filename.endsWith(code.file) || code.file.endsWith(file.filename)) {
                        alertPromises.push(codeToAlert(code, file));
                    }
                });
                break;
            case 'folder':
                filesWithContent.map((file) => {
                    if (file.filename.includes(code.file)) {
                        alertPromises.push(codeToAlert(code, file));
                    }
                });
                break;
            case 'lines':
                filesWithContent.map((file: FileInfo) => {
                    if (didChange(code, file)) {
                        alertPromises.push(codeToAlert(code, file));
                    }
                });
                break;
        }
    });

    const alertResponses = await Promise.all(alertPromises);
    const alerts = alertResponses.filter((alert) => alert != null);
    
    return res.status(200).send({alerts});
});

export default alertsRouter;
