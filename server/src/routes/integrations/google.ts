import { Router } from 'express';
import { google as googleapis } from 'googleapis';
import Org from '../../models/Org';
import { userMiddleware } from '../user';

const googleRouter = Router();
const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/routes/integrations/google/authorization'
      : 'https://connect.mintlify.com/routes/integrations/google/authorization';
const oAuth2Client = new googleapis.auth.OAuth2(client_id, client_secret, redirect_uri);
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

  // Need an error handler here for Google tokens retrieval, but will implement later.
  const { tokens } = await oAuth2Client.getToken(code as string);
  oAuth2Client.setCredentials(tokens);

  if (state == null) return res.status(403).send('No state provided');
  const { org: orgId } = JSON.parse(decodeURIComponent(state as string));
  const org = await Org.findByIdAndUpdate(orgId, {
    'integrations.google': tokens,
  });

  if (org == null) {
    return res.status(403).send({ error: 'Invalid organization ID' });
  }

  const FRONTEND_URL =
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://${org.subdomain}.mintlify.com`;

  return res.redirect(302, FRONTEND_URL);
});

export type GoogleDocs = {
  id: string
  name: string
  url: string
  lastEditedAgo: string
}

googleRouter.get('/sync', userMiddleware, async (_, res) => {
  const { org: orgId } = res.locals.user

  const org = await Org.findById(orgId);

  if (org == null) {
    return res.status(401).json({ error: 'No org found' });
  }
  let google = org.integrations?.google;
  if (!google || !google.access_token) {
    return res.status(403).json({ error: 'No access token found for Google' })
  }

  oAuth2Client.setCredentials(google)
  const googleDrive = googleapis.drive({ version: 'v3', auth: oAuth2Client })
  let allFiles: any = []
  let nextPageToken: string | null | undefined = ''

  try {
    const { data }: any = await (nextPageToken !== ''
      ? googleDrive.files.list({
          q: 'mimeType="application/vnd.google-apps.document" and trashed=false',
          fields: 'nextPageToken, files(id, name)',
          pageToken: nextPageToken,
          spaces: 'drive',
        })
      : googleDrive.files.list({
          q: 'mimeType="application/vnd.google-apps.document" and trashed=false',
          fields: 'nextPageToken, files(id, name, modifiedTime, createdTime)',
        }))
    nextPageToken = data.nextPageToken
    allFiles = allFiles.concat(data.files);
  } catch (error: any) {
    return res.status(500).send(error)
  }

  return res.status(200).json({ results: allFiles })
})

export default googleRouter;
