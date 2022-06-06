import * as cheerio from 'cheerio';
import { isNotionUrl } from './notion';
import { isGoogleDocsUrl, getGoogleDocsData } from './googleDocs';
import validUrl from 'valid-url';
import Org from '../models/Org';
import { getContentFromHTML } from '../helpers/routes/domparsing';
import { getNotionPageData } from './notion';
import axios from 'axios';

type WebScrapingMethod = 'readme' | 'stoplight' | 'docusaurus' | 'github' | 'notion-public' | 'notion-private' | 'googledocs' | 'confluence-public' | 'gitbook' | 'web';

type ScrapingMethod = WebScrapingMethod;

const possiblyGetWebScrapingMethod = ($: cheerio.CheerioAPI): WebScrapingMethod => {
  const readmeVersion = $('meta[name="readme-version"]');
  if (readmeVersion.length > 0) {
    return 'readme';
  }
  const stoplightConnect = $('link[href="https://js.stoplight.io"]');
  if (stoplightConnect.length > 0) {
    return 'stoplight';
  }
  const githubContent = $('meta[content="GitHub"]');
  const hasReadmeId = $('#readme');
  if (githubContent.length > 0 && hasReadmeId.length > 0) {
    return 'github';
  }
  const notionApp = $('#notion-app');
  if (notionApp.length > 0) {
    return 'notion-public';
  }
  const confluenceId = $('#com-atlassian-confluence');
  if (confluenceId.length > 0) {
    return 'confluence-public';
  }
  const docusaurusVersion = $('meta[name="docusaurus_version"]');
  if (docusaurusVersion.length > 0) {
    return 'docusaurus';
  }
  const gitBookRoot = $('div[class="gitbook-root"]');
  const contentEditor = $('div[data-testid="page.contentEditor"]');
  if (gitBookRoot.length > 0 && contentEditor.length > 0) {
    return 'gitbook';
  }
  return 'web';
};

export type ContentData = {
  method: ScrapingMethod;
  title: string;
  content: string;
  favicon?: string;
};

export const getDataFromWebpage = async (url: string, orgId: string, wait = 1000): Promise<ContentData> => {
  if (!url) {
    throw 'URL not provided';
  }
  if (!validUrl.isUri(url)) {
    throw 'Is not valid URL';
  }
  const urlParsed = new URL(url);
  const org = await Org.findById(orgId);
  if (isNotionUrl(urlParsed) && org?.integrations?.notion) {
    const notionAccessToken = org.integrations.notion.access_token;
    return await getNotionPageData(url, notionAccessToken);
  }
  // Only use the Google API to handle unpublished Google Docs for now since it doesn't work with published document yet.
  else if (isGoogleDocsUrl(urlParsed) && !url.includes('/pub')) {
    const parsedUrl = new URL(url);
    return await getGoogleDocsData(parsedUrl);
  }

  const { data: response } = await axios.get('https://app.scrapingbee.com/api/v1', {
    params: {
      'api_key': process.env.SCRAPINGBEE_KEY,
      url,
      wait: wait.toString(),
      'block_resources': 'false'
    } 
  });

  const rawContent = response;
  return extractDataFromHTML(url, rawContent);
};

// Extract information
export const extractDataFromHTML = async (url: string, html: string): Promise<ContentData> => {
  const $ = cheerio.load(html);
  const scrapingMethod = possiblyGetWebScrapingMethod($);

  const title = $('title').first().text().trim();
  let favicon = $('link[rel="shortcut icon"]').attr('href') || $('link[rel="icon"]').attr('href');
  if (favicon?.startsWith('//')) {
    favicon = `https:${favicon}`;
  } else if (favicon?.startsWith('/')) {
    const urlParsed = new URL(url);
    favicon = `${urlParsed.origin}${favicon}`;
  }
  if (!favicon) {
    try {
      const faviconRes = await axios.get(`https://s2.googleusercontent.com/s2/favicons?sz=128&domain_url=${url}`);
      favicon = faviconRes.request.res.responseUrl;
    } catch {
      favicon = undefined;
    }
  }
  // Remove unneeded for content
  $('iframe').remove();
  $('script').remove();
  $('style').remove();
  $('title').remove();

  let section;

  switch (scrapingMethod) {
    case 'readme':
      $('#updated-at').nextAll().remove();
      $('#updated-at').remove();
      $('nav').remove();
      $('header.rm-Header').remove();
      $('.PageThumbs').remove();
      section = $('body');
      break;
    case 'stoplight':
      section = $('.Editor');
      break;
    case 'docusaurus':
      section = $('.markdown');
      break;
    case 'github':
      section = $('#readme');
      break;
    case 'notion-public':
      $('.notion-overlay-container').remove();
      section = $('.notion-page-content');
      break;
    case 'confluence-public':
      $('.recently-updated').remove();
      section = $('#content-body');
      break;
    case 'gitbook':
      section = $('div[data-testid="page.contentEditor"]');
      break;
    default:
      section = $('body');
      if ($('body').find('main').length > 0) {
        section = $('body main');
      } 
  }

  const content = getContentFromHTML(section);

  return {
    method: scrapingMethod,
    title,
    content,
    favicon,
  };
}