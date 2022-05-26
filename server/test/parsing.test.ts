import { expect } from '@jest/globals';
import { checkIfUrl } from '../src/helpers/routes/links';

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