import { Router } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import AuthConnector from '../models/AuthConnector';

dotenv.config();

const slackRouter = Router();
slackRouter.get('/install', async (req, res) => {
    const { github } = req.query;
    if (!github) {
        return res.send('Github ID is required');
    }

    const state = {
        source: 'github',
        id: github
    };

    const encodedState = encodeURIComponent(JSON.stringify(state));
    // const url = getSlackURL
});

slackRouter.get('/authorization', async (req, res) => {
    const { github, code } = req.query;
    if (!github) {
        return res.send('Github ID is required');
    }

    const url = 'https://slack.com/api/oauth.v2.access';
    const response = await axios.post(url, {
        client_id: '2329388587911.3498023797925',
        client_secret: process.env.SLACK_CLIENT_SECRET,
        code
    });

    const accessToken = response.data.access_token;
    const credentials = {
        source: 'github',

    }
    await AuthConnector.findOneAndUpdate()
});
