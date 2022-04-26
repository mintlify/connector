import express from 'express';
import { ConnectFile, Alert } from './types';
import { createNewLinksMessage, getAlertsForAllFiles } from './alerts';
import { track } from 'services/segment';
import AuthConnector from 'models/AuthConnector';

const v01Router = express.Router();

const getAuthConnector = (sourceId: string) => {
    return AuthConnector.findOne({sourceId});
}

v01Router.post('/', async (req, res) => {
    const { files, owner } : { files: ConnectFile[], owner: string; } = req.body;

    if (files == null) return res.status(400).end();
    if (owner == null) return res.status(400).end();

    const authConnector = await getAuthConnector(owner);
    const allAlerts = await getAlertsForAllFiles(files, authConnector);
    const alerts = allAlerts.filter((alert) => alert.type !== 'new');

    const newLinks: Alert[] = allAlerts.filter((alert) => alert.type === 'new');
    const newLinksMessage = newLinks.length > 0 ? await createNewLinksMessage(newLinks, authConnector) : null;

    // logging
    const isAlerting = alerts.length > 0;
    const alertEvent = isAlerting ? 'Connect Alert' : 'Connect Not Alert';
    track(owner, alertEvent, {
        numberOfFiles: files.length,
        numberOfAlerts: alerts.length
    });

    return res.status(200).send({
        alerts,
        newLinksMessage
    });
});

export default v01Router;