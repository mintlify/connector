import * as cheerio from 'cheerio';
import he from 'he';

export const getContentFromHTML = (element: cheerio.Cheerio<cheerio.Element>) => {
  const html = element.html();
  if (html == null) return '';

  return removeHtmlTagsAndGetText(html);
}

export const removeHtmlTagsAndGetText = (html: string) => {
  const parsedHTML = html.replace(/<(?:.|\n)*?>/gm, '\n');
  const decodedHTML = he.decode(parsedHTML);
  return removeRedundantWhitespace(decodedHTML);
}

// Remove all extra newlines and whitespaces for each line
const removeRedundantWhitespace = (str: string) => {
  const trimmed = str.trim();

  const results = trimmed.split('\n').map((line) => line.trim()).filter((line) => line)
  return results.join('\n');
}