import { replaceRelativeWithAbsolutePathsInMarkdown } from '../src/helpers/routes/markdown';

describe('Testing markdown absolute paths', () => {
  test('Relative path', () => {
    const markdown = '[Testing](/LICENSE)';
    const baseUrl = 'https://raw.githubusercontent.com/mintlify/server/main';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: baseUrl, link: baseUrl }, 'mintlify/server/main');

    expect(result).toBe('[Testing](https://raw.githubusercontent.com/mintlify/server/main/LICENSE)');
  });

  test('Relative path with dot', () => {
    const markdown = '[Testing](./LICENSE)';
    const baseUrl = 'https://raw.githubusercontent.com/mintlify/server/main/vscode/README.md';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: baseUrl, link: baseUrl }, 'mintlify/server/main');

    expect(result).toBe('[Testing](https://raw.githubusercontent.com/mintlify/server/main/vscode/LICENSE)');
  });

  test('Relative path with no prefix', () => {
    const markdown = '[Testing](subpro/subtext.md)';
    const baseUrl = 'https://raw.githubusercontent.com/mintlify/server/main/vscode/README.md';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: baseUrl, link: baseUrl }, 'mintlify/server/main');

    expect(result).toBe('[Testing](https://raw.githubusercontent.com/mintlify/server/main/vscode/subpro/subtext.md)');
  });

  test('Relative path backwards', () => {
    const markdown = '[Testing](../../)';
    const baseUrl = 'https://raw.githubusercontent.com/mintlify/server/main/vscode/sub/subsub/LICENSE.md';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: baseUrl, link: baseUrl }, 'mintlify/server/main');

    expect(result).toBe('[Testing](https://raw.githubusercontent.com/mintlify/server/main/vscode/)');
  });

  test('Path breakdown', () => {
    const markdown = '[Testing](./README.md)';
    const url = 'https://mintlifyon.atlassian.com/path/wiki/here.js';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: url, link: url });
    expect(result).toBe('[Testing](https://mintlifyon.atlassian.com/path/wiki/README.md)');
  })

  test('Image tag path', () => {
    const markdown = '<img src="./image.png" width="100%" />';
    const url = 'https://mintlifyon.atlassian.com/path/wiki/here.js';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: url, link: url });
    expect(result).toBe('<img src="https://mintlifyon.atlassian.com/path/wiki/image.png" width="100%" />');
  });

  test('Anchor tag path', () => {
    const markdown = '<a href="./index.js">Link</a>';
    const url = 'https://mintlifyon.atlassian.com/path/wiki/here.js';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: url, link: url });
    expect(result).toBe('<a href="https://mintlifyon.atlassian.com/path/wiki/index.js">Link</a>');
  });

  test('Image tag', () => {
    const markdown = '<img src="/vscode/assets/dropdown.png" width="250px" />';
    const baseUrl = 'https://raw.githubusercontent.com/mintlify/mintlify/main/vscode/README.md';
    const result = replaceRelativeWithAbsolutePathsInMarkdown(markdown, { img: baseUrl, link: baseUrl }, 'mintlify/mintlify/main');
    expect(result).toBe('<img src="https://raw.githubusercontent.com/mintlify/mintlify/main/vscode/assets/dropdown.png" width="250px" />')
  })
})