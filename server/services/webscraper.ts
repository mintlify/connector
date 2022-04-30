import webScrapingApiClient from 'webscrapingapi';
import * as cheerio from 'cheerio';

const client = new webScrapingApiClient(process.env.WEBSCRAPER_KEY);

export const getContentFromWebpage = async (): Promise<string> => {
  const response = await client.get('https://mintlify.readme.io/reference/start', {
        render_js: 1,
        proxy_type: 'datacenter',
        country: 'us',
        session: 1,
        timeout: 10000,
        wait_until: 'domcontentloaded',
        wait_for: 2000,
    });
    if (response.success) {
        const content = response.response.data;
        const $ = cheerio.load(content);
        const text = $('body').text().trim();

        return text;
    } else {
        return '';
    }
}