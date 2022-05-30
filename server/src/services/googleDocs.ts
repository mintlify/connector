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

const scopes = ['https://www.googleapis.com/auth/documents.readonly'];

const jwt = {
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  auth_email: process.env.GOOGLE_AUTH_EMAIL,
};

// const auth = new google.auth.JWT(jwt.client_email, undefined, jwt.private_key, scopes, jwt.auth_email);
// const docs = google.docs({ version: 'v1', auth });

const GOOGLE_DOCS_ICON = 'https://res.cloudinary.com/mintlify/image/upload/v1653175048/googledocs-icon_im6j4z.svg';

export const isGoogleDocsUrl = (url: URL): boolean => url.host === 'docs.google.com' || url.host === 'www.docs.google.com';

export const getGoogleDocsData = async (url: URL): Promise<ContentData> => {
  console.log("Google's jwt = ", jwt);

  try {
    const auth = new google.auth.JWT(jwt.client_email, undefined, jwt.private_key, scopes, jwt.auth_email);
    console.log('successfully initialized the google auth object');
    const docs = google.docs({ version: 'v1', auth });

    console.log('successfully initiate google docs api connector');

    const documentId: string = url.pathname.split('/')[3];
    const res = await docs.documents.get({ documentId });
    const title = res.data.title ? res.data.title : 'No Title';

    if (!res.data.body || !res.data.body.content)
      return {
        method: 'googledocs',
        title,
        content: 'Error getting content data',
        favicon: GOOGLE_DOCS_ICON,
      };

    const content: any = res.data.body?.content;
    let accumulateContent = '';

    content
      .filter((block: any) => block.hasOwnProperty('paragraph'))
      .map(({ paragraph }: { paragraph: Paragraph }) => {
        paragraph.elements.map(
          ({ textRun: { content } }: { textRun: { content: string } }) => (accumulateContent = `${accumulateContent}${content}`)
        );
      });

    return {
      method: 'googledocs',
      title,
      content: accumulateContent,
      favicon: GOOGLE_DOCS_ICON,
    };
  } catch (error) {
    console.log('Unsuccessfully initialize the Google API connector');
    console.log('error = ', error);

    return {
      method: 'googledocs',
      title: 'Error getting content data',
      content: 'Error getting content data',
      favicon: GOOGLE_DOCS_ICON,
    };
  }
};
