export type ScrapingMethod = 'notion-private' | 'googledocs-private' | 'confluence-private' | 'web' | 'github';

export type ContentData = {
  method: ScrapingMethod;
  title: string;
  content: string;
  favicon?: string;
};