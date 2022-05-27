import express from 'express';
import { Alert, AlertsRequest } from '../helpers/github/types';
import Code, { CodeType } from '../models/Code';
import { codeToAlert, didChange } from '../helpers/routes/alerts';
import { FileInfo } from '../helpers/github/patch';
import Event, { EventType } from '../models/Event';
import Org from '../models/Org';
import { track } from '../services/segment';

const alertsRouter = express.Router();

alertsRouter.post('/', async (req, res) => {
    const alertsRequest: AlertsRequest = req.body;
    const { files, owner, repo } = alertsRequest;

    if (files == null || owner == null || repo == null) return res.status(400).end();

    const codes = await Code.find({ gitOrg: owner, repo });
    
    if (codes.length === 0) {
        return res.status(200).send({alerts: []});
    }

    const alertPromises: Promise<Alert|null>[] = [];
    const codesWithAlerts: CodeType[] = codes.filter((code: CodeType) => {
        let hasAlert = false;
        switch (code.type) {
            case 'file':
                files.map((file) => {
                    if (file.filename.endsWith(code.file) || code.file.endsWith(file.filename)) {
                        alertPromises.push(codeToAlert(code, file));
                        hasAlert = true;
                    }
                });
                break;
            case 'folder':
                files.map((file) => {
                    if (file.filename.includes(code.file)) {
                        alertPromises.push(codeToAlert(code, file));
                        hasAlert = true;
                    }
                });
                break;
            case 'lines':
                files.map((file: FileInfo) => {
                    if (didChange(code, file)) {
                        alertPromises.push(codeToAlert(code, file));
                        hasAlert = true;
                    }
                });
                break;
        }
        return hasAlert;
    });

    const alertResponses = await Promise.all(alertPromises);
    const alerts = alertResponses.filter((alert) => alert != null);
    const org = await Org.findOne({ 'integrations.github.installations[0].account.login': owner });
    if (org) {
        const events: EventType[] = codesWithAlerts.map((code) => {
            const event: EventType = {
                org: org._id,
                doc: code.doc,
                type: 'code',
                code: code._id
            };
            return event;
        });
        await Event.insertMany(events);

        track(org._id.toString(), 'GitHub alert triggered', {
            isOrg: true,
            numberOfEvents: events.length,
        })
    }
    
    return res.status(200).send({alerts});
});

export default alertsRouter;
