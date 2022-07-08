import axios from "axios";
import * as cheerio from 'cheerio';

const prependUrlToRelativePath = (element: cheerio.Element, $: cheerio.CheerioAPI, url: string, attr: string): void => {
  const oldAttr = $(element).attr(attr);
  const newAttr = oldAttr && oldAttr[0] === '/' ? `/${url.replace(/\/$/, '')}${oldAttr}` : oldAttr;
  $(element).attr(attr, newAttr);
};

export const getPreviewHtml = async (url: string) => {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);
  // $("link").each(function() {
  //   prependUrlToRelativePath(this, $, url, 'href');
  // });
  // $("a").each(function() {
  //   prependUrlToRelativePath(this, $, url, 'href');
  // });
  $("img").each(function() {
    prependUrlToRelativePath(this, $, url, 'src');
  });
  // $("script").each(function() {
  //   prependUrlToRelativePath(this, $, url, 'src');
  // });
  const parsedHtml = $.html();
  const htmlWithAbsoluteUrl = `<base href="https://mintlify-cors.herokuapp.com/${url}" target="_blank">${parsedHtml}`;
  return htmlWithAbsoluteUrl;
};
