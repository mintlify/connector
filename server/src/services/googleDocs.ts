import { google } from 'googleapis'
import dotenv from 'dotenv'
import { ContentData } from './webscraper'
import { GoogleCredentials } from '../routes/integrations/google'
// load environment variables
dotenv.config()

export type ParagraphElement = {
  startIndex: number
  endIndex: number
  textRun: {
    content: string
    textStyle: {}
  }
}

export type Paragraph = {
  elements: ParagraphElement[]
  paragraphStyle?: any
}

const client_id = process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/routes/integrations/google/authorization'
      : 'https://connect.mintlify.com/routes/integrations/google/authorization'
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri)

const GOOGLE_DOCS_ICON = 'https://res.cloudinary.com/mintlify/image/upload/v1653175048/googledocs-icon_im6j4z.svg'

export const isGoogleDocsUrl = (url: URL): boolean => url.host === 'docs.google.com' || url.host === 'www.docs.google.com'

export const getGoogleDocsData = async (url: URL, credentials: GoogleCredentials): Promise<ContentData> => {
  oAuth2Client.setCredentials(credentials)
  const docs = google.docs({ version: 'v1', auth: oAuth2Client })

  const documentId: string = url.pathname.split('/')[3]
  const res = await docs.documents.get({ documentId })
  const title = res.data.title ? res.data.title : 'No Title'

  if (!res.data.body || !res.data.body.content)
    return {
      method: 'googledocs',
      title,
      content: 'Error getting content data',
      favicon: GOOGLE_DOCS_ICON,
    }

  const content: any = res.data.body?.content
  let accumulatedContent = ''

  content
    .filter((block: any) => block.hasOwnProperty('paragraph'))
    .map(({ paragraph }: { paragraph: Paragraph }) => {
      paragraph.elements.map(
        ({ textRun: { content } }: { textRun: { content: string } }) => (accumulatedContent = `${accumulatedContent}${content}`)
      )
    })

  return {
    method: 'googledocs',
    title,
    content: accumulatedContent,
    favicon: GOOGLE_DOCS_ICON,
  }
}
