import { Router } from 'express';
import dotenv from 'dotenv';
import { getSlackAccessTokenFromCode, getSlackAuthUrl } from '../services/slack';
import Org from '../models/Org';

dotenv.config();

const slackRouter = Router();
slackRouter.get('/install', async (req, res) => {
    const { org } = req.query;
    if (!org) {
        return res.send('Organization ID is required');
    }

    const state = { org };

    const encodedState = encodeURIComponent(JSON.stringify(state));
    const url = getSlackAuthUrl(encodedState);
    return res.redirect(url);
});

slackRouter.get('/authorization', async (req, res) => {
    const { code, state } = req.query;
    if (code == null) return res.status(403).send('Invalid or missing grant code');

    const { response, error } = await getSlackAccessTokenFromCode(code as string);

    if (error) return res.status(403).send('Invalid grant code');
    if ( state == null) return res.status(403).send('No state provided');

    const { org } = JSON.parse(decodeURIComponent(state as string));
    const accessToken = response.data.access_token;
    await Org.findByIdAndUpdate(org, {
        "integration.slack.accessToken": accessToken
    });
    return res.redirect('slack://open');
});
