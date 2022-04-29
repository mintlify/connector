import { Router } from 'express';
import AuthConnector from 'models/AuthConnector';
import { getNotionAccessTokenFromCode, getNotionURL } from 'services/notion';

const notionRouter = Router();

notionRouter.get('/install', (req, res) => {
  const { github } = req.query;
  if (!github) {
    return res.send('Github ID is required');
  }

  const state = {
    source: 'github',
    id: github
  }

  const encodedState = encodeURIComponent(JSON.stringify(state));
  const url = getNotionURL(encodedState);
  return res.redirect(url);
});

notionRouter.get('/authorization', async (req, res) => {
  const { code, state } = req.query;
  if (code == null) return res.status(403).send('Invalid or missing grant code');

  const { response, error } = await getNotionAccessTokenFromCode(code as string);

  if (error) return res.status(403).send('Invalid grant code')
  if (state == null) return res.status(403).send('No state provided');

  const stateParsed = JSON.parse(decodeURIComponent(state as string));

  const credentials = {
    source: stateParsed.source,
    sourceId: stateParsed.id,
  }

  const notionAuth = {
    ...credentials,
    notion: {
      accessToken: response.access_token,
      botId: response.bot_id,
      workspaceName: response.workspace_name,
      workspaceIcon: response.workspace_icon,
      workspaceId: response.workspace_id,
    }
  };
  
  await AuthConnector.findOneAndUpdate(credentials, notionAuth, { upsert: true });
  return res.redirect('https://notion.so');
});

export default notionRouter;