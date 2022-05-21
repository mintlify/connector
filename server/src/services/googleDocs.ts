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
export const docs = google.docs({ version: "v1", auth });

export const isGoogleDocsUrl = (url: URL): boolean => url.host === "docs.google.com" || url.host === "www.docs.google.com";

export const getGoogleDocsTitle = async (url: URL): Promise<string> => {
  const response = await docs.documents.get({
    documentId: url.pathname.split("/")[2],
  });
  return response.data.title ? response.data.title : "Error: Title not found";
};
