import express from 'express';
import { ConnectFile, Alert } from '../../helpers/types';
import { createNewLinksMessage, getAlertsForAllFiles } from '../../helpers/alerts';
import { track } from 'services/segment';
import AuthConnector from 'models/AuthConnector';
import { sha512Hash } from 'helpers/hash';

const v01Router = express.Router();

const getAuthConnector = (sourceId: string) => {
    const hashedSourceId = sha512Hash(sourceId);
    return AuthConnector.findOne({hashedSourceId});
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

v01Router.get('/integrations', async (req, res) => {
    const { owner }: { owner: string } = req.body;

    if (owner == null) return res.status(400).end();

    const { gitbook, alerts } = await getAuthConnector(owner);

    return res.status(200).send({
        gitbook,
        alerts
    })
});

v01Router.post('/auth', async (req, res) => {
    const { owner, source } = req.body;
    const authConnector = {
        sourceId: owner,
        source
    };
    await AuthConnector.create(authConnector);
    return res.status(200).end();
});

export default v01Router;