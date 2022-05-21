import { google } from "googleapis";
import dotenv from "dotenv";
// load environment variables
dotenv.config();

const scopes = ["https://www.googleapis.com/auth/documents.readonly"];

const jwt = {
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  auth_email: process.env.GOOGLE_AUTH_EMAIL,
};

const auth = new google.auth.JWT(jwt.client_email, undefined, jwt.private_key, scopes, jwt.auth_email);

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

export const isGoogleDocsUrl = (url: URL): boolean => url.host === "docs.google.com" || url.host === "www.docs.google.com";

export const getGoogleDocsTitle = async (url: URL): Promise<string> => {
  const docs = google.docs({ version: "v1", auth });
  console.log("url.pathname", url.pathname);
  console.log("url.pathname.split('/')[3] = ", url.pathname.split("/")[3]);
  try {
    const documentId = url.pathname.split("/")[3].toString();
    const response = await docs.documents.get({ documentId });
    return response.data.title ? response.data.title : "";
  } catch (err) {
    console.log("error catched");
    console.log(err);
    return "Title not found";
  }
};

export const getGoogleDocsContent = async (): Promise<string> => {
  try {
    const documentId: string = "1vYV9TUw8VFpuGatfgmOvcRSpHxuDkuN0zBS4p2GIQoU";
    console.log(`documentId = |${documentId}|`);
    console.log("auth = ", auth);
    const docs = google.docs({ version: "v1", auth });
    const res = await docs.documents.get({ documentId });
    console.log("Got res!");
    if (!res.data.body) return "";
    const content: any = res.data.body?.content;
    if (!content) return "";
    let accumulateContent = "";

    content
      .filter((block: any) => block.hasOwnProperty("paragraph"))
      .map(({ paragraph }: { paragraph: Paragraph }) => {
        paragraph.elements.map(
          ({ textRun: { content } }: { textRun: { content: string } }) => (accumulateContent = `${accumulateContent}${content}`)
        );
      });

    return accumulateContent;
  } catch (err) {
    console.log(err);
    return "Dummy content";
  }
};
