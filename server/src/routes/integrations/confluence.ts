import { Router } from 'express';
import { google as googleapis } from 'googleapis';
import { ISDEV } from '../../helpers/environment';
import Doc from '../../models/Doc';
import Org from '../../models/Org';
import { userMiddleware } from '../user';

export type GoogleDoc = {
  id: string
  name: string
  createdTime: string
  modifiedTime: string
}

const confluenceRouter = Router();
const client_id = ISDEV
  ? 'XbG4M6XbC63P3J8USptlNwvWkKQUC23P'
  : 'IUsX3rcUbGOQ7Jjkn0xFG6HNtdvhjmAg';
const redirect_uri = ISDEV
  ? 'http://localhost:5000/routes/integrations/confluence/authorization'
  : 'https://connect.mintlify.com/routes/integrations/confluence/authorization';

confluenceRouter.get('/install', async (req, res) => {
  const { org, close } = req.query;
  if (!org) return res.status(404).send('Organization ID is required');

  const state = { org, close };
  const encodedState = encodeURIComponent(JSON.stringify(state));

  const confluenceAuthUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${client_id}&scope=read%3Aconfluence-user%20read%3Aconfluence-content.all&redirect_uri=${redirect_uri}&state=${encodedState}&response_type=code&prompt=consent`;
  return res.redirect(confluenceAuthUrl);
});

confluenceRouter.get('/authorization', async (req, res) => {
    const { code, state } = req.query;
    if (code == null) return res.status(403).send('Invalid or missing grant code');

    try {
      // const { tokens } = await oAuth2Client.getToken(code as string);
      // oAuth2Client.setCredentials(tokens);

      // if (state == null) return res.status(403).send('No state provided');
      // const parsedState = JSON.parse(decodeURIComponent(state as string));

      // const { org: orgId } = parsedState;
      // const org = await Org.findByIdAndUpdate(orgId, {
      //   'integrations.google': tokens,
      // });

      // if (org == null) {
      //   return res.status(403).send({ error: 'Invalid organization ID' });
      // }
      
      // if (parsedState?.close) {
      //   return res.send("<script>window.close();</script>");
      // }
      // return res.redirect(`https://${org.subdomain}.mintlify.com`);
      console.log(code);
      res.end();
    } catch (error) {
      return res.status(500).send("Unable to install Google integration")
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
