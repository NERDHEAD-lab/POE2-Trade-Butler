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

  test('rejects legacy Daum trade search URLs for current page parsing', () => {
    expect(
      parseSearchUrl(
        'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur/abc123'
      )
    ).toBeNull();
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
  afterEach(() => {
    jest.restoreAllMocks();
  });

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

  test('does not rebuild URLs from a legacy Daum current page', () => {
    const legacyUrl = 'https://poe.game.daum.net/trade2/search/poe2/Legacy/abc123';
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(
      getUrlFromSearchHistory(
        {
          id: 'abc123',
          url: legacyUrl
        },
        'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur'
      )
    ).toBe(legacyUrl);
    expect(consoleError).toHaveBeenCalledWith(
      'error_invalid_url_format:https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur',
      '#f00'
    );
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

  test('does not treat legacy Daum pages as current Korean server pages', () => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: {
          href: 'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur'
        }
      }
    });

    expect(isKoreanServer()).toBe(false);
  });

  test('maps Kakao Games host to kr region', () => {
    expect(
      getServerRegion(
        new URL('https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur')
      )
    ).toBe('kr');
  });

  test('keeps legacy Daum URLs mapped to kr for saved data compatibility', () => {
    expect(
      getServerRegion(
        new URL('https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur')
      )
    ).toBe('kr');
  });
});
