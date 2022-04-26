import { createMessage, getAlertsForFile } from 'routes/v01/alerts';
import { Alert, Change, ConnectFile } from 'routes/v01/types';

describe('Auth connector', () => {
  const notionAuthConnector = {
    source: 'github',
    sourceId: 'mintlify',
    notion: {
      accessToken: process.env.NOTION_KEY
    }
  }
  test('Valid Notion Link', async () => {
    const changes: Change[] = [{
      type: 'add',
      line: 2,
      content: "console.log('hello world!');"
    }];
  
    const file: ConnectFile = 
        {
            filename: 'test.js',
            content: `// https://www.notion.so/mintlify/Laws-of-Documentation-f167f65678e8495e9af7519a87fca13e
            console.log('hello world');`,
            changes
        };
    const alerts: Alert[] = await getAlertsForFile(file, notionAuthConnector);
    const expectedLink = {
      url: 'https://www.notion.so/mintlify/Laws-of-Documentation-f167f65678e8495e9af7519a87fca13e',
      lineRange: { start: 1, end: 2 },
      type: 'file'
    }
    expect(alerts).toEqual([{
        url: expectedLink.url,
        message: await createMessage(expectedLink, notionAuthConnector),
        filename: 'test.js',
        lineRange: expectedLink.lineRange,
        type: 'file'
    }])
  });
})