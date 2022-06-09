import { Router } from 'express';
import { google } from 'googleapis';

import Org from '../../models/Org';

const googleRouter = Router();
const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/routes/integrations/google/authorization'
      : 'https://connect.mintlify.com/routes/integrations/google/authorization';
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
// If modifying these scopes, you must prompt user to get new refresh & access tokens.
const SCOPES = [
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/documents.readonly',
];

googleRouter.get('/install', async (req, res) => {
  const { org } = req.query;
  if (!org) return res.status(404).send('Organization ID is required');

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  const state = { org };
  const encodedState = encodeURIComponent(JSON.stringify(state));

  const fullAuthUrl = `${authUrl}&state=${encodedState}`;

  return res.redirect(302, fullAuthUrl);
});

googleRouter.get('/authorization', async (req, res) => {
  const { code, state } = req.query;
  if (code == null) return res.status(403).send('Invalid or missing grant code');

  const { tokens } = await oAuth2Client.getToken(code as string);
  oAuth2Client.setCredentials(tokens);

  if (state == null) return res.status(403).send('No state provided');
  const { org: orgId } = JSON.parse(decodeURIComponent(state as string));
  const org = await Org.findByIdAndUpdate(orgId, {
    'integrations.google': {
      accessToken: tokens.access_token,
      expiryDate: tokens.expiry_date,
      refreshToken: tokens.refresh_token,
    },
  });

  if (org == null) {
    return res.status(403).send({ error: 'Invalid organization ID' });
  }

  const FRONTEND_URL =
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://${org.subdomain}.mintlify.com`) +
    '/settings/organization#integrations';

  return res.redirect(302, FRONTEND_URL);
});

export default googleRouter;
