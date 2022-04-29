import { getDocumentNameFromUrl } from 'helpers/alerts';

describe('Extracting title', () => {
  test('Getting page title from Google', async () => {
    const url = 'https://www.google.com/';
    const title = await getDocumentNameFromUrl(url);
    expect(title).toBe('Google');
  });

  test('Getting page title from Mintlify docs', async () => {
    const url = 'https://mintlify.com/security';
    const title = await getDocumentNameFromUrl(url);
    expect(title).toBe('Security | Mintlify');
  });

  test('Get example from GitHub', async () => {
    const url = 'mihir.ch';
    const title = await getDocumentNameFromUrl(url);
    expect(title).toBe('Mihir Chaturvedi · plibither8');
  })
})