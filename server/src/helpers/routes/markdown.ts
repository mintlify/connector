const getAbsolutePath = (baseUrl: string, pathToFile: string, rootPath: string) => {
  if (pathToFile[0] === '/') {
    const origin = new URL(pathToFile, baseUrl).origin;
    return `${origin}/${rootPath}${pathToFile}`;
  }
  return new URL(pathToFile, baseUrl).toString();
}

export const replaceRelativeWithAbsolutePathsInMarkdown = (markdown: string, baseUrl: { img: string, link: string }, rootPath = '') => {
  const linkRegex = /\!?\[(?<title>[^\]]*)\]\((?<pathToFile>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;
  let result;
  result = markdown.replace(linkRegex, (matched: string, title: string, pathToFile: string, optionalpart: string) => {
    if (/https?:\/\//i.test(pathToFile)) {
      return matched;
    }

    const filenameOptional = optionalpart ? ' ' + optionalpart : '';

    if (matched[0] === '!') {
      const absolutePath = getAbsolutePath(baseUrl.img, pathToFile, rootPath);
      return `![${title}](${absolutePath}${filenameOptional})`;
    }

    const absolutePath = getAbsolutePath(baseUrl.link, pathToFile, rootPath);
    return `[${title}](${absolutePath}${filenameOptional})`;
  });

  result = result.replace(/src="([^"]+)"/g, (matched: string, src: string) => {
    if (/https?:\/\//i.test(src)) {
      return matched;
    };
    const absolutePath = getAbsolutePath(baseUrl.img, src, rootPath);
    return `src="${absolutePath}"`;
  });

  result = result.replace(/href="([^"]+)"/g, (matched: string, href: string) => {
    if (/https?:\/\//i.test(href)) {
      return matched;
    };
    
    const absolutePath = getAbsolutePath(baseUrl.link, href, rootPath);
    return `href="${absolutePath}"`;
  });

  return result;
}