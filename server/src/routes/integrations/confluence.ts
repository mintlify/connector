import axios from 'axios';
import { Router } from 'express';
import { ISDEV } from '../../helpers/environment';
import Org from '../../models/Org';
import { userMiddleware } from '../user';

export type GoogleDoc = {
  id: string
  name: string
  createdTime: string
  modifiedTime: string
}

const confluenceRouter = Router();
const clientId = process.env.CONFLUENCE_CLIENT_ID;
const clientSecret = process.env.CONFLUENCE_CLIENT_SECRET;
const redirectUri = ISDEV
  ? 'http://localhost:5000/routes/integrations/confluence/authorization'
  : 'https://connect.mintlify.com/routes/integrations/confluence/authorization'

confluenceRouter.get('/install', async (req, res) => {
  const { org, close } = req.query;
  if (!org) return res.status(404).send('Organization ID is required');

  const state = { org, close };
  const encodedState = encodeURIComponent(JSON.stringify(state));

  const confluenceAuthUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=read%3Aconfluence-user%20read%3Aconfluence-content.all%20offline_access&redirect_uri=${redirectUri}&state=${encodedState}&response_type=code&prompt=consent`;
  return res.redirect(confluenceAuthUrl);
});

confluenceRouter.get('/authorization', async (req, res) => {
    const { code, state } = req.query;
    if (code == null) return res.status(403).send('Invalid or missing grant code');
    if (state == null) return res.status(403).send('No state provided');

    try {
      const { data: { access_token, expires_in, scope, refresh_token } } = await axios.post('https://auth.atlassian.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      });

      const parsedState = JSON.parse(decodeURIComponent(state as string));
      const { org: orgId } = parsedState;
      const org = await Org.findByIdAndUpdate(orgId, {
        'integrations.confluence': {
          access_token,
          expires_in,
          refresh_token,
          scope
        },
      });

      if (org == null) {
        return res.status(403).send({ error: 'Invalid organization ID' });
      }
      
      if (parsedState?.close) {
        return res.send("<script>window.close();</script>");
      }
      return res.redirect(`https://${org.subdomain}.mintlify.com`);
    } catch (error) {
      return res.status(500).send("Unable to install Confluence integration. Refresh to try again")
    }
});

confluenceRouter.post('/sync', userMiddleware, async (_, res) => {
  const { org: orgId } = res.locals.user

  const org = await Org.findById(orgId);

  if (org == null) {
    return res.status(401).json({ error: 'No org found' });
  }
  // let google = org.integrations?.google;
  // if (google?.access_token == null) {
  //   return res.status(403).json({ error: 'No access token found for Google' })
  // }

  // oAuth2Client.setCredentials(google)
  // const googleDrive = googleapis.drive({ version: 'v3', auth: oAuth2Client })
  // let nextPageToken: string | null | undefined = ''

  try {
  //   const { data }: any = await (nextPageToken !== ''
  //     ? googleDrive.files.list({
  //         q: 'mimeType="application/vnd.google-apps.document" and trashed=false',
  //         fields: 'nextPageToken, files(id, name)',
  //         pageToken: nextPageToken,
  //         spaces: 'drive',
  //       })
  //     : googleDrive.files.list({
  //         q: 'mimeType="application/vnd.google-apps.document" and trashed=false',
  //         fields: 'nextPageToken, files(id, name, modifiedTime, createdTime)',
  //       }))
  //   nextPageToken = data.nextPageToken
  //   const allFiles: GoogleDoc[] = data.files;
  //   const existingDocs = await Doc.find({ org: orgId, method: 'googledocs-private' });
  //   const results = allFiles
  //     .filter((googleDoc) => {
  //       return !existingDocs.some((doc) => doc.googledocs?.id === googleDoc.id);
  //     });

    return res.status(500).send("Unable to install Google integration")
    // return res.status(200).json({ results })
  } catch (error: any) {
    return res.status(500).send(error)
  }
})

export default confluenceRouter;
