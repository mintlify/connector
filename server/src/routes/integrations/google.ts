import { Router } from 'express';
import { google as googleapis } from 'googleapis';
import Doc from '../../models/Doc';
import Org from '../../models/Org';
import { userMiddleware } from '../user';

export type GoogleDoc = {
  id: string
  name: string
  createdTime: string
  modifiedTime: string
}

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
  const { org, close } = req.query;
  if (!org) return res.status(404).send('Organization ID is required');

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  const state = { org, close };
  const encodedState = encodeURIComponent(JSON.stringify(state));

  const fullAuthUrl = `${authUrl}&state=${encodedState}`;

  return res.redirect(fullAuthUrl);
});

googleRouter.get('/authorization', async (req, res) => {
    const { code, state } = req.query;
    if (code == null) return res.status(403).send('Invalid or missing grant code');

    try {
      const { tokens } = await oAuth2Client.getToken(code as string);
      oAuth2Client.setCredentials(tokens);

      if (state == null) return res.status(403).send('No state provided');
      const parsedState = JSON.parse(decodeURIComponent(state as string));

      const { org: orgId } = parsedState;
      const org = await Org.findByIdAndUpdate(orgId, {
        'integrations.google': tokens,
      });

      if (org == null) {
        return res.status(403).send({ error: 'Invalid organization ID' });
      }
      
      if (parsedState?.close) {
        return res.send("<script>window.close();</script>");
      }
      return res.redirect(`https://${org.subdomain}.mintlify.com`);
    } catch (error) {
      return res.send("Unable to install Google integration")
    }
});

googleRouter.post('/sync', userMiddleware, async (_, res) => {
  const { org: orgId } = res.locals.user

  const org = await Org.findById(orgId);

  if (org == null) {
    return res.status(401).json({ error: 'No org found' });
  }
  let google = org.integrations?.google;
  if (google?.access_token == null) {
    return res.status(403).json({ error: 'No access token found for Google' })
  }

  oAuth2Client.setCredentials(google)
  const googleDrive = googleapis.drive({ version: 'v3', auth: oAuth2Client })
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
    const allFiles: GoogleDoc[] = data.files;
    const existingDocs = await Doc.find({ org: orgId, method: 'googledocs-private' });
    const results = allFiles
      .filter((googleDoc) => {
        return !existingDocs.some((doc) => doc.googledocs?.id === googleDoc.id);
      });

    return res.status(200).json({ results })
  } catch (error: any) {
    return res.status(500).send(error)
  }
})

export default googleRouter;
