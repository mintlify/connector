// https://www.notion.so/mintlify/Connect-d9d337715f974520a793da685b056415
import { Router } from 'express';
import Org from '../models/Org';
import { getNotionAccessTokenFromCode, getNotionInstallURL } from '../services/notion';

const notionRouter = Router();

notionRouter.get('/install', (req, res) => {
  const { org } = req.query;
  if (!org) {
    return res.send('Organization ID is required');
  }

  const state = { org }

  const encodedState = encodeURIComponent(JSON.stringify(state));
  const url = getNotionInstallURL(encodedState);
  return res.redirect(url);
});

notionRouter.get('/authorization', async (req, res) => {
  const { code, state } = req.query;
  if (code == null) return res.status(403).send('Invalid or missing grant code');

  const { response, error } = await getNotionAccessTokenFromCode(code as string);

  if (error) return res.status(403).send('Invalid grant code')
  if (state == null) return res.status(403).send('No state provided');

  const  { org } = JSON.parse(decodeURIComponent(state as string));

  // Add notion credentials
  await Org.findByIdAndUpdate(org, {
    "integrations.notion": {
      accessToken: response?.access_token,
      botId: response?.bot_id,
      workspaceName: response?.workspace_name,
      workspaceIcon: response?.workspace_icon,
      workspaceId: response?.workspace_id,
    }
  })
  return res.redirect('https://notion.so');
});

export default notionRouter;