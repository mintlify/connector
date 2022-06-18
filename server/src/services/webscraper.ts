type WebScrapingMethod =  'notion-private' | 'googledocs-private' | 'confluence-private' | 'web';

export type ScrapingMethod = WebScrapingMethod;

export type ContentData = {
  method: ScrapingMethod;
  title: string;
  content: string;
  favicon?: string;
};