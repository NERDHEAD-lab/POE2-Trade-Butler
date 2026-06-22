import { jest } from '@jest/globals';

describe('GoogleDriveApi', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'chrome');
    jest.restoreAllMocks();
    jest.resetModules();
  });

  test('uses chrome.identity directly in the background service worker context', async () => {
    const getAuthToken = jest.fn(
      (options: chrome.identity.TokenDetails, callback: (token?: string) => void) => {
        expect(options).toEqual({ interactive: true });
        callback('direct-token');
      }
    );
    const sendMessage = jest.fn();
    const connect = jest.fn();
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify([{ id: 'favorite-1' }])));

    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        runtime: {
          lastError: undefined,
          connect,
          sendMessage
        },
        identity: {
          getAuthToken,
          removeCachedAuthToken: jest.fn()
        }
      }
    });

    const { GoogleDriveApi } = await import('./GoogleDriveApi');

    const content = await GoogleDriveApi.readFile('favoriteFolders_v2-file-id');

    expect(content).toBe(JSON.stringify([{ id: 'favorite-1' }]));
    expect(getAuthToken).toHaveBeenCalledWith({ interactive: true }, expect.any(Function));
    expect(connect).not.toHaveBeenCalled();
    expect(sendMessage).not.toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://www.googleapis.com/drive/v3/files/favoriteFolders_v2-file-id?alt=media',
      expect.objectContaining({
        headers: expect.any(Headers)
      })
    );
    const headers = (fetchSpy.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer direct-token');
  });
});
