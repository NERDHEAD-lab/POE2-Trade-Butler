import { jest } from '@jest/globals';

jest.unstable_mockModule('../utils/api', () => ({
  isKoreanServer: () => false
}));

jest.unstable_mockModule('../utils/toast', () => ({
  showToast: jest.fn()
}));

jest.unstable_mockModule('../utils/_locale', () => ({
  getMessage: (key: string) => key
}));

jest.unstable_mockModule('../storage/cacheData', () => ({
  getOrFetchCache: jest.fn(
    (_key: string, _ttl: number, supplier: () => Promise<{ data: unknown }>) => supplier()
  )
}));

const { applyKoreanTranslate } = await import('./koreanTranslate');

describe('applyKoreanTranslate', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'chrome');
    Reflect.deleteProperty(globalThis, 'document');
    Reflect.deleteProperty(globalThis, 'localStorage');
    jest.clearAllMocks();
  });

  test('fetches Korean trade static data from Kakao Games', async () => {
    const sendMessage = jest.fn(
      (message: { type: string; url: string }, callback: (response: { data: unknown }) => void) => {
        callback({ data: {} });
      }
    );

    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        runtime: {
          sendMessage
        }
      }
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        readyState: 'complete'
      }
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        setItem: jest.fn()
      }
    });

    await applyKoreanTranslate();

    expect(sendMessage).toHaveBeenCalledTimes(4);
    expect(sendMessage.mock.calls.map(([message]) => message.url)).toEqual([
      'https://poe.kakaogames.com/api/trade2/data/items',
      'https://poe.kakaogames.com/api/trade2/data/filters',
      'https://poe.kakaogames.com/api/trade2/data/stats',
      'https://poe.kakaogames.com/api/trade2/data/static'
    ]);
  });
});
