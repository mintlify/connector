import { google } from 'googleapis';
import dotenv from 'dotenv';
import { ContentData } from './webscraper';
// load environment variables
dotenv.config();

export type ParagraphElement = {
  startIndex: number;
  endIndex: number;
  textRun: {
    content: string;
    textStyle: {};
  };
};

export type Paragraph = {
  elements: ParagraphElement[];
  paragraphStyle?: any;
};

export type GoogleDocsCredentials = {
  refresh_token?: string | null;
  expiry_date?: number | null;
  access_token?: string | null;
  token_type?: string | null;
  id_token?: string | null;
  scope?: string;
}

const scopes = ['https://www.googleapis.com/auth/documents.readonly'];

const jwt = {
  private_key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  auth_email: process.env.GOOGLE_AUTH_EMAIL,
};

export const isGoogleDocsUrl = (url: URL): boolean => url.host === 'docs.google.com' || url.host === 'www.docs.google.com';

export const getGoogleDocsData = async (url: URL): Promise<ContentData> => {
  const auth = new google.auth.JWT(jwt.client_email, undefined, jwt.private_key, scopes, jwt.auth_email);
  const docs = google.docs({ version: 'v1', auth });

  const documentId: string = url.pathname.split('/')[3];
  const res = await docs.documents.get({ documentId });
  const title = res.data.title ? res.data.title : 'No Title';

  if (!res.data.body || !res.data.body.content)
    return {
      method: 'googledocs-public',
      title,
      content: '',
    };

  const content: any = res.data.body?.content;
  let accumulatedContent = '';

  content
    .filter((block: any) => block.hasOwnProperty('paragraph'))
    .map(({ paragraph }: { paragraph: Paragraph }) => {
      paragraph.elements.map(
        ({ textRun: { content } }: { textRun: { content: string } }) => (accumulatedContent = `${accumulatedContent}${content}`)
      );
    });

  return {
    method: 'googledocs-public',
    title,
    content: accumulatedContent,
  };
};

const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/routes/integrations/google/authorization'
      : 'https://connect.mintlify.com/routes/integrations/google/authorization'
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri)

export const getGoogleDocsPrivateData = async (googleDocId: string, credentials: GoogleDocsCredentials): Promise<ContentData> => {
  oAuth2Client.setCredentials(credentials)
  const docs = google.docs({ version: 'v1', auth: oAuth2Client });

  const res = await docs.documents.get({ documentId: googleDocId })
  const title = res.data.title ? res.data.title : '';

  const content: any = res.data.body?.content || [];
  let accumulatedContent = ''

  content
    .filter((block: any) => block.hasOwnProperty('paragraph'))
    .map(({ paragraph }: { paragraph: Paragraph }) => {
      const { elements } = paragraph;
      elements.forEach((element) => {
        const { textRun } = element;
        if (textRun?.content) {
          accumulatedContent = `${accumulatedContent}${textRun.content}`;
        }
      })
    });
  
  return {
    method: 'googledocs-private',
    title,
    content: accumulatedContent,
  };
}