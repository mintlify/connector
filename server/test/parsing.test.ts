import { createMessage } from '../src/helpers/routes/messages';
import { getAlertsForAllFiles, getAlertsForFile } from '../src/helpers/routes/v01Alerts';
import { checkIfUrl } from '../src/helpers/routes/links';
import { Alert, Change } from '../src/helpers/github/types';
import { FileInfo } from '../src/helpers/github/patch';

describe('URL checker', () => {
  test('Simple URL', () => {
    const isUrl = checkIfUrl('google.com');
    expect(isUrl).toBeTruthy();
  })
  test('URL with http', () => {
    const isUrl = checkIfUrl('http://github.com');
    expect(isUrl).toBeTruthy();
  })
  test('URL with protocol', () => {
    const isUrl = checkIfUrl('https://notion.so/mintlify/Ithaca-Product-Meeting-36b4bcf8b6e444bcbf3c2944163b27dd');
    expect(isUrl).toBeTruthy();
  })
  test('URL with no protocol', () => {
    const isUrl = checkIfUrl('notion.so/mintlify/Ithaca-Product-Meeting-36b4bcf8b6e444bcbf3c2944163b27dd');
    expect(isUrl).toBeTruthy();
  })
  test('URL with params', () => {
    const isUrl = checkIfUrl('notion.so/testing?query=3');
    expect(isUrl).toBeTruthy();
  })
  test('Invalid URL', () => {
    const isUrl = checkIfUrl('what');
    expect(isUrl).toBeFalsy();
  })
  test('Empty string', () => {
    const isUrl = checkIfUrl('');
    expect(isUrl).toBeFalsy();
  })
  test('Email address', () => {
    const isUrl = checkIfUrl('hi@mintlify.com');
    expect(isUrl).toBeTruthy();
  })
})

describe('Connect parsing', () => {
    test('One line change', async () => {
        const changes: Change[] = [{
            type: 'add',
            line: 2,
            content: "console.log('hello world!');"
        }];

        const file: FileInfo = 
          {
              filename: 'test.js',
              content: `// notion.so
              console.log('hello world');`,
              changes
          };
        const alerts = await getAlertsForFile(file);
        const expectedLink = {
          url: 'notion.so',
          lineRange: { start: 1, end: 2 },
          type: 'file'
        }
        expect(alerts).toEqual([{
            url: expectedLink.url,
            message: await createMessage(expectedLink),
            filename: 'test.js',
            lineRange: expectedLink.lineRange,
            type: 'file'
        }])
    });

    test('One line change - diff comment style', async () => {
        const changes: Change[] = [{
            type: 'add',
            line: 2,
            content: "console.log('hello world!');"
        }];

        const file: FileInfo = 
          {
              filename: 'test.js',
              content: `/* notion.so */
              console.log('hello world');`,
              changes
          };
        const alerts = await getAlertsForFile(file);
        const expectedLink = {
          url: 'notion.so',
          lineRange: { start: 1, end: 2 },
          type: 'file'
        }
        expect(alerts).toEqual([{
            url: expectedLink.url,
            message: await createMessage(expectedLink),
            filename: 'test.js',
            lineRange: expectedLink.lineRange,
            type: 'file'
        }])
    });

    test('One line change in multi-line function', async () => {
        const changes: Change[] = [{
            type: 'add',
            line: 4,
            content: 'const dataType = isType ? "joe" : "cat";'
        }];

        const file: FileInfo = 
          {
              filename: 'joe.js',
              content: `// https://twitter.com/home
              const createCards = (group, isType) => {
                  const cards = [];
                  const dataType = isType ? "type" : "category";
                  return dataType;
              };`,
              changes
          };
        const alerts = await getAlertsForFile(file);
        const expectedLink = {
          url: 'https://twitter.com/home',
          lineRange: { start: 1, end: 6 },
          type: 'file'
        }
        expect(alerts).toEqual([{
            url: expectedLink.url,
            message: await createMessage(expectedLink),
            filename: 'joe.js',
            lineRange: expectedLink.lineRange,
            type: 'file'
        }])
    });

    test('Multiple line-file with comment', async () => {
        const changes: Change[] = [
          {
            type: 'delete',
            line: 45,
            content: '    const files: File[] = [];'
          },
          { type: 'delete', line: 46, content: '    ' },
          {
            type: 'delete',
            line: 47,
            content: '    filesContext.forEach(async (fileContext) => {'
          },
          { type: 'delete', line: 48, content: '      try {' },
          {
            type: 'delete',
            line: 49,
            content: '        const contentRequest = context.repo({ path: fileContext.path, ref: baseRef });'
          },
          {
            type: 'delete',
            line: 50,
            content: '        const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };'
          },
          {
            type: 'delete',
            line: 51,
            content: "        const contentString = Buffer.from(content.data.content, 'base64').toString();"
          },
          { type: 'delete', line: 52, content: '' },
          {
            type: 'delete',
            line: 53,
            content: '        const changes = parsePatch(fileContext.patch);'
          },
          { type: 'delete', line: 54, content: '' },
          { type: 'delete', line: 55, content: '        files.push({' },
          {
            type: 'delete',
            line: 56,
            content: '          filename: fileContext.path,'
          },
          {
            type: 'delete',
            line: 57,
            content: '          content: contentString,'
          },
          { type: 'delete', line: 58, content: '          changes: changes' },
          { type: 'delete', line: 59, content: '        })' },
          { type: 'delete', line: 60, content: '' },
          { type: 'delete', line: 61, content: '      } catch {' },
          {
            type: 'delete',
            line: 62,
            content: "        context.log.error(`File doesn't exist for ${fileContext.path}`);"
          },
          { type: 'delete', line: 63, content: '      }' },
          {
            type: 'add',
            line: 45,
            content: '    const getFilesContentPromises = filesContext.map((fileContext) => {'
          },
          {
            type: 'add',
            line: 46,
            content: '      return new Promise(async (resolve) => {'
          },
          { type: 'add', line: 47, content: '        try {' },
          {
            type: 'add',
            line: 48,
            content: '          const contentRequest = context.repo({ path: fileContext.path, ref: baseRef });'
          },
          {
            type: 'add',
            line: 49,
            content: '          const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };'
          },
          {
            type: 'add',
            line: 50,
            content: "          const contentString = Buffer.from(content.data.content, 'base64').toString();"
          },
          { type: 'add', line: 51, content: '  ' },
          {
            type: 'add',
            line: 52,
            content: '          const changes = parsePatch(fileContext.patch);'
          },
          { type: 'add', line: 53, content: '  ' },
          { type: 'add', line: 54, content: '          resolve({' },
          {
            type: 'add',
            line: 55,
            content: '            filename: fileContext.path,'
          },
          {
            type: 'add',
            line: 56,
            content: '            content: contentString,'
          },
          { type: 'add', line: 57, content: '            changes: changes' },
          { type: 'add', line: 58, content: '          })' },
          { type: 'add', line: 59, content: '  ' },
          { type: 'add', line: 60, content: '        } catch {' },
          { type: 'add', line: 61, content: '          resolve(null);' },
          { type: 'add', line: 62, content: '        }' },
          { type: 'add', line: 63, content: '      })' },
          {
            type: 'delete',
            line: 66,
            content: '    const response = await axios.get(`http://localhost:5000/connect/v01/`, {'
          },
          { type: 'delete', line: 67, content: '      data: {' },
          { type: 'delete', line: 68, content: '        files,' },
          { type: 'delete', line: 69, content: '        owner,    ' },
          { type: 'delete', line: 70, content: '      }' },
          {
            type: 'add',
            line: 66,
            content: '    const files = await Promise.all(getFilesContentPromises) as File[];'
          },
          {
            type: 'add',
            line: 67,
            content: '    const response = await axios.post(`http://localhost:5000/connect/v01/`, {'
          },
          { type: 'add', line: 68, content: '      files,' },
          { type: 'add', line: 69, content: '      owner,' },
          {
            type: 'add',
            line: 76,
            content: '    const comments = alerts.map((alert) => {'
          }
        ];

        const files: FileInfo[] = [{
            filename: 'src/index.ts',
            changes,
            content: `import { Probot } from "probot";
            import axios from 'axios';
            import { Change, parsePatch } from "./patch";
            
            type File = {
              filename: string;
                content: string;
                changes: Change[]
            }
            
            type LineRange = {
              start: number;
              end: number;
            }
            
            type Alert = {
              url: string;
              message: string;
              fileName: string;
              lineRange: LineRange
            }
            
            export = (app: Probot) => {
              app.on(["pull_request.opened", "pull_request.reopened"], async (context) => {
                const owner = context.payload.repository.owner.login;
                const repo = context.payload.repository.name;
                const pullNumber = context.payload.number;
                const baseRef = context.payload.pull_request.base.ref;
            
                const pullRequestFiles = await context.octokit.pulls.listFiles({
                  owner,
                  repo,
                  pull_number: pullNumber,
                  page: 0,
                  per_page: 100
                });
            
                const filesContext = pullRequestFiles.data.map(file => {
                  return {
                    path: file.filename,
                    patch: file.patch
                  }
                });
                
                const getFilesContentPromises = filesContext.map((fileContext) => {
                  return new Promise(async (resolve) => {
                    try {
                      const contentRequest = context.repo({ path: fileContext.path, ref: baseRef });
                      const content = await context.octokit.repos.getContent(contentRequest) as { data: { content: string } };
                      const contentString = Buffer.from(content.data.content, 'base64').toString();
              
                      const changes = parsePatch(fileContext.patch);
              
                      resolve({
                        filename: fileContext.path,
                        content: contentString,
                        changes: changes
                      })
              
                    } catch {
                      resolve(null);
                    }
                  })
                });
            
                const files = await Promise.all(getFilesContentPromises) as File[];
                const response = await axios.post(\`http://localhost:5000/connect/v01/\`, {
                  files,
                  owner,
                });
            
                const alerts: Alert[] = response.data.alerts;
                if (alerts?.length === 0) return;
            
                // https://github.com/mintlify/connect
                const comments = alerts.map((alert) => {
                  return {
                    body: alert.message,
                    path: alert.fileName,
                    start_line: alert.lineRange.start,
                    start_side: 'RIGHT',
                    line: alert.lineRange.end,
                    side: 'RIGHT'
                  };
                });
            
                await context.octokit.pulls.createReview({
                  owner,
                  repo,
                  pull_number: pullNumber,
                  body: 'Documentation review required',
                  commit_id: context.payload.pull_request.head.sha,
                  event: 'REQUEST_CHANGES',
                  comments,
                })
              });
            
              app.on('pull_request_review_thread.resolved' as any, async (context) => {
                const owner = context.payload.repository.owner.login;
                const repo = context.payload.repository.name;
                const pullNumber = context.payload.pull_request.number;
                const reviewComments: any = await context.octokit.graphql(\`query FetchReviewComments {
                  repository(owner: "\${owner}", name: "\${repo}") {
                    pullRequest(number: \${pullNumber}) {
                      reviewDecision
                      reviewThreads(first: 100) {
                        edges {
                          node {
                            isResolved
                            comments(first: 1) {
                              edges {
                                node {
                                  body
                                  author {
                                    login
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }\`);
            
                const ADMIN_LOGIN = 'mintlify-connect';
            
                const allAdminReviewComments = reviewComments.repository.pullRequest.reviewThreads.edges.filter((edge: any) => {
                  return edge.node.comments.edges[0].node.author.login === ADMIN_LOGIN;
                });
            
                const isAllResolved = allAdminReviewComments.every((comment: any) => comment.node.isResolved);
            
                if (isAllResolved) {
                  await context.octokit.pulls.createReview({
                    owner,
                    repo,
                    pull_number: pullNumber,
                    body: 'All document fixes have been addressed',
                    commit_id: context.payload.pull_request.head.sha,
                    event: 'APPROVE'
                  })
                }
              })
            };`
        }];

        const alerts = await getAlertsForAllFiles(files);
        const expectedLink = {
          url: 'https://github.com/mintlify/connect',
          lineRange: { start: 76, end: 85 },
          type: 'lines'
        }
        expect(alerts).toEqual([{
            url: expectedLink.url,
            message: await createMessage(expectedLink),
            filename: 'src/index.ts',
            lineRange: expectedLink.lineRange,
            type: 'lines'
        }])
    });

    test('Simple link at top of message', async () => {
      const changes: Change[] = [
      {
        type: 'add',
        line: 4,
        content: 'const await createMessage = (link: Link): string => {'
      }];

      const files: FileInfo[] = [
        {
          filename: 'routes/connect/v01/alerts.ts',
          content: `import { Link, Alert } from './types';

          // https://github.com
          const await createMessage = (link: Link): string => {
              // TODO: if notion link, fetch content
              // TODO: URLs that address alerts
              const { start, end } = link.lineRange;
              const isOneLineRange = start === end;
              const lineMessage = isOneLineRange ? \`in line \${start}\` : \`in lines \${start} - \${end}\`
              return \`Changes \${lineMessage} is connected to [document](\${link.url}). Resolve if it is irrelevant or has been addressed\`;
          }
          
          export const linkToAlert = (link: Link, filename: string): Alert => {
              return {
                  url: link.url,
                  message: await createMessage(link),
                  filename,
                  lineRange: link.lineRange
              }
          };`,
          changes
        }
      ];

      const alerts: Alert[] = await getAlertsForAllFiles(files);
      const expectedLink = {
        url: 'https://github.com',
        lineRange: { start: 4, end: 11 },
        type: 'lines'
      }
      expect(alerts).toEqual([{
          url: expectedLink.url,
          message: await createMessage(expectedLink),
          filename: 'routes/connect/v01/alerts.ts',
          lineRange: expectedLink.lineRange,
          type: 'lines'
      }])
    });

    test('Link just added', async () => {
      const changes: Change[] = [{
        type: 'add',
        line: 3,
        content: '// https://github.com'
      },
      {
        type: 'add',
        line: 4,
        content: 'const await createMessage = (link: Link): string => {'
      }];

      const files: FileInfo[] = [
        {
          filename: 'routes/connect/v01/alerts.ts',
          content: `import { Link, Alert } from './types';

          // https://github.com
          const await createMessage = (link: Link): string => {
              // TODO: if notion link, fetch content
              // TODO: URLs that address alerts
              const { start, end } = link.lineRange;
              const isOneLineRange = start === end;
              const lineMessage = isOneLineRange ? \`in line \${start}\` : \`in lines \${start} - \${end}\`
              return \`Changes \${lineMessage} is connected to [document](\${link.url}). Resolve if it is irrelevant or has been addressed\`;
          }
          
          export const linkToAlert = (link: Link, filename: string): Alert => {
              return {
                  url: link.url,
                  message: await createMessage(link),
                  filename,
                  lineRange: link.lineRange
              }
          };`,
          changes
        }
      ];

      const alerts: Alert[] = await getAlertsForAllFiles(files);
      const expectedLink = {
        url: 'https://github.com',
        lineRange: { start: 4, end: 11 },
        type: 'lines'
      }
      expect(alerts).toEqual([{
        filename: 'routes/connect/v01/alerts.ts',
        lineRange: expectedLink.lineRange,
        message: '',
        type: 'new',
        url: expectedLink.url
      }]);
    });

    test('No link but just a regular comment', async () => {
      const changes: Change[] = [{
        type: 'add',
        line: 12,
        content: '// TODO: Random comment'
      }];

      const files: FileInfo[] = [
        {
          filename: 'routes/connect/v01/alerts.ts',
          content: `import { Link, Alert } from './types';

          const await createMessage = (link: Link): string => {
              // TODO: if notion link, fetch content
              // TODO: URLs that address alerts
              const { start, end } = link.lineRange;
              const isOneLineRange = start === end;
              const lineMessage = isOneLineRange ? \`in line \${start}\` : \`in lines \${start} - \${end}\`
              return \`Changes \${lineMessage} is connected to [document](\${link.url}). Resolve if it is irrelevant or has been addressed\`;
          }
          
          // TODO: Random comment
          export const linkToAlert = (link: Link, filename: string): Alert => {
              return {
                  url: link.url,
                  message: await createMessage(link),
                  filename,
                  lineRange: link.lineRange
              }
          };`,
          changes
        }
      ];

      const alerts: Alert[] = await getAlertsForAllFiles(files);
      expect(alerts).toEqual([])
    });

    test('Changes below in the file associated with link at top of file', async () => {
      const changes: Change[] = [{
          type: 'add',
          line: 12,
          content: '}'
      }];

      const file: FileInfo = 
          {
              filename: 'joe.js',
              content: `// https://twitter.com/home

              const createCards = (group, isType) => {
                  const cards = [];
                  const dataType = isType ? "type" : "category";
                  return dataType;
              };
              console.log('hello');
              console.log('world');
              const main = () => {
                console.log('yo');
              }`,
              changes
          };
      const alerts: Alert[] = await getAlertsForFile(file);
      const expectedLink = {
        url: 'https://twitter.com/home',
        lineRange: { start: 1, end: 12 },
        type: 'file'
      }
      expect(alerts).toEqual([{
          url: expectedLink.url,
          message: await createMessage(expectedLink),
          filename: 'joe.js',
          lineRange: expectedLink.lineRange,
          type: 'file'
      }])
  });
})