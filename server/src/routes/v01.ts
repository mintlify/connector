import express from 'express';
import { Alert, AlertsRequest } from '../helpers/github/types';
import { createNewLinksMessage, getAlertsForAllFiles } from '../helpers/routes/v01Alerts';
import { track } from '../services/segment';

const v01Router = express.Router();

v01Router.post('/', async (req, res) => {
    const alertsRequest: AlertsRequest = req.body;
    const { files, owner } = alertsRequest;

    if (files == null) return res.status(400).end();
    if (owner == null) return res.status(400).end();

    const allAlerts = await getAlertsForAllFiles(files);
    const alerts = allAlerts.filter((alert) => alert.type !== 'new');

    const newLinks: Alert[] = allAlerts.filter((alert) => alert.type === 'new');
    const newLinksMessage = newLinks.length > 0 ? await createNewLinksMessage(newLinks) : null;

    // logging
    const isAlerting = alerts.length > 0;
    const alertEvent = isAlerting ? 'Connect Alert' : 'Connect Not Alert';

    track(owner, alertEvent, {
        numberOfFiles: files.length,
        numberOfAlerts: alerts.length
    });

    // Still needs work
    return res.status(200).send({
        alerts,
        newLinksMessage
    });
});

export default v01Router;