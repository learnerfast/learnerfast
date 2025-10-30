import { getVideoTypeFromUrl } from './videoUtils';

describe('getVideoTypeFromUrl', () => {
  it('should return "iframe" for iframe code', () => {
    const url = '<iframe src="https://example.com"></iframe>';
    expect(getVideoTypeFromUrl(url)).toBe('iframe');
  });
});
