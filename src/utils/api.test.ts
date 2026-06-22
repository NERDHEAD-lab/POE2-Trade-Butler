import { jest } from '@jest/globals';

jest.unstable_mockModule('./_locale', () => ({
  getMessage: (key: string, ...substitutions: string[]) =>
    [key, ...substitutions].join(':')
}));

const {
  getServerRegion,
  getUrlFromSearchHistory,
  isKoreanServer,
  parseSearchUrl
} = await import('./api');

describe('parseSearchUrl', () => {
  test('parses Kakao Games trade search URLs', () => {
    expect(
      parseSearchUrl(
        'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/abc123'
      )
    ).toEqual({
      serverName: 'Runes of Aldur',
      id: 'abc123'
    });
  });

  test('still parses GGG regional trade search URLs', () => {
    expect(
      parseSearchUrl(
        'https://jp.pathofexile.com/trade2/search/poe2/Runes%20of%20Aldur/abc123'
      )
    ).toEqual({
      serverName: 'Runes of Aldur',
      id: 'abc123'
    });
  });
});

describe('getUrlFromSearchHistory', () => {
  test('rebuilds a search history URL for the current Kakao Games page', () => {
    expect(
      getUrlFromSearchHistory(
        {
          id: 'abc123',
          url: 'https://poe.game.daum.net/trade2/search/poe2/Legacy/abc123'
        },
        'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur'
      )
    ).toBe('https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/abc123');
  });
});

describe('Korean server detection', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'window');
  });

  test('treats Kakao Games trade pages as Korean server pages', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: {
          href: 'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur'
        }
      }
    });

    expect(isKoreanServer()).toBe(true);
  });

  test('maps Kakao Games host to kr region', () => {
    expect(
      getServerRegion(
        new URL('https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur')
      )
    ).toBe('kr');
  });
});
