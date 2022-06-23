export const replaceRelativeWithAbsolutePathsInMarkdown = (markdown: string, path: string) => {
  const linkRegex = /\[(?<title>[^\]]*)\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;
  const absoluteMarkdown = markdown.replace(linkRegex, (_, title: string, filename: string, optionalpart: string) => {
    console.log({title, filename, optionalpart});
    if (/https?:\/\//i.test(filename)) {
      return `[${title}](${filename}${optionalpart})`;
    }

    const absolutePath = new URL(filename, path).href;
    return `[${title}](${absolutePath}${optionalpart ? ' ' + optionalpart : ''})`;
  });

  return absoluteMarkdown;
}