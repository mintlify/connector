import { createMessage } from '../src/helpers/routes/messages';
import { getAlertsForFile } from '../src/helpers/routes/v01Alerts';
import { Alert, Change } from '../src/helpers/github/types';
import { FileInfo } from '../src/helpers/github/patch';

describe('Auth connector', () => {
  const notionAuthConnector = {
    source: 'github',
    sourceId: 'mintlify',
    notion: {
      accessToken: process.env.NOTION_KEY as string
    }
  }
  test('Valid Notion Link', async () => {
    const changes: Change[] = [{
      type: 'add',
      line: 2,
      content: "console.log('hello world!');"
    }];
  
    const file: FileInfo = 
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