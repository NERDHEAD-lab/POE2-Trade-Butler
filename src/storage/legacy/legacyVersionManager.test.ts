import { jest } from '@jest/globals';

jest.unstable_mockModule('../../utils/_locale', () => ({
  getMessage: (key: string, ...substitutions: string[]) =>
    [key, ...substitutions].join(':')
}));

jest.unstable_mockModule('../storageUsage', () => ({
  usageInfoAll: jest.fn(async () => ({
    local: { entities: [] },
    sync: { entities: [] }
  }))
}));

const googleDriveFiles = new Map<string, string>();
const googleDriveReadFailures = new Set<string>();

jest.unstable_mockModule('../../utils/GoogleDriveApi', () => ({
  GoogleDriveApi: {
    createFile: jest.fn(async (name: string, content: string) => {
      googleDriveFiles.set(name, content);
      return name;
    }),
    readFile: jest.fn(async (fileId: string) => {
      if (googleDriveReadFailures.has(fileId)) {
        throw new Error('Drive read failed');
      }
      return googleDriveFiles.get(fileId) ?? '[]';
    }),
    updateFile: jest.fn(async (fileId: string, content: string) => {
      googleDriveFiles.set(fileId, content);
    })
  }
}));

type StorageStore = Record<string, unknown>;
type StorageGetKeys = string | string[] | Record<string, unknown> | null;
type StorageGetCallback = (items: StorageStore) => void;

function hasOwn(store: StorageStore, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(store, key);
}

function createStorageArea(store: StorageStore): chrome.storage.StorageArea {
  const get = jest.fn((keys: StorageGetKeys, callback?: StorageGetCallback) => {
    let result: StorageStore;

    if (keys === null) {
      result = { ...store };
    } else if (typeof keys === 'string') {
      result = hasOwn(store, keys) ? { [keys]: store[keys] } : {};
    } else if (Array.isArray(keys)) {
      result = keys.reduce<StorageStore>((result, key) => {
        if (hasOwn(store, key)) result[key] = store[key];
        return result;
      }, {});
    } else {
      result = Object.entries(keys).reduce<StorageStore>((result, [key, defaultValue]) => {
        result[key] = hasOwn(store, key) ? store[key] : defaultValue;
        return result;
      }, {});
    }

    callback?.(result);
    return callback ? undefined : Promise.resolve(result);
  });
  const set = jest.fn((items: StorageStore, callback?: () => void) => {
    Object.assign(store, items);
    callback?.();
    return callback ? undefined : Promise.resolve();
  });
  const remove = jest.fn((keys: string | string[], callback?: () => void) => {
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      delete store[key];
    }
    callback?.();
    return callback ? undefined : Promise.resolve();
  });

  return {
    get,
    set,
    remove,
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  } as unknown as chrome.storage.StorageArea;
}

describe('executeLegacyVersionMigrations', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'chrome');
    googleDriveFiles.clear();
    googleDriveReadFailures.clear();
    jest.restoreAllMocks();
    jest.resetModules();
  });

  test('migrates stored Daum trade URLs to Kakao Games URLs', async () => {
    const favoriteChunk = [
      {
        id: 'root',
        type: 'folder',
        name: '/',
        parentId: null,
        createdAt: '2026-06-22T00:00:00.000Z',
        modifiedAt: '2026-06-22T00:00:00.000Z'
      },
      {
        id: 'favorite-1',
        type: 'file',
        name: 'Runes of Aldur',
        parentId: 'root',
        createdAt: '2026-06-22T00:00:00.000Z',
        modifiedAt: '2026-06-22T00:00:00.000Z',
        metadata: {
          id: 'abc123',
          url: 'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur/abc123'
        }
      }
    ];
    const localStore: StorageStore = {
      poe2trade_storage_version: 5,
      searchHistory: [
        {
          id: 'abc123',
          url: 'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur/abc123',
          lastSearched: '2026-06-22T00:00:00.000Z',
          previousSearches: []
        }
      ]
    };
    const syncStore: StorageStore = {
      '__chunk__:favoriteFolders::__meta': {
        v: 1,
        parts: 1,
        chunkSize: 7500,
        originalSize: JSON.stringify(favoriteChunk).length
      },
      '__chunk__:favoriteFolders::_part_0': favoriteChunk
    };

    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        runtime: {
          lastError: undefined
        },
        storage: {
          local: createStorageArea(localStore),
          sync: createStorageArea(syncStore)
        }
      }
    });

    const { executeLegacyVersionMigrations } = await import('./legacyVersionManager');

    await executeLegacyVersionMigrations();

    const searchHistory = localStore.searchHistory as Array<{ url: string }>;
    const favoritePart = syncStore['__chunk__:favoriteFolders::_part_0'] as Array<{
      metadata?: { url: string };
    }>;

    expect(searchHistory[0].url).toBe(
      'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/abc123'
    );
    expect(favoritePart[1].metadata?.url).toBe(
      'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/abc123'
    );
    expect(localStore.poe2trade_storage_version).toBe(6);
  });

  test('migrates stored Daum trade URLs in Google Drive synced favorites', async () => {
    const favoriteEntries = [
      {
        id: 'root',
        type: 'folder',
        name: '/',
        parentId: null,
        createdAt: '2026-06-22T00:00:00.000Z',
        modifiedAt: '2026-06-22T00:00:00.000Z'
      },
      {
        id: 'favorite-daum',
        type: 'file',
        name: 'Daum legacy favorite',
        parentId: 'root',
        createdAt: '2026-06-22T00:00:00.000Z',
        modifiedAt: '2026-06-22T00:00:00.000Z',
        metadata: {
          id: 'abc123',
          url: 'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur/abc123'
        }
      },
      {
        id: 'favorite-ggg',
        type: 'file',
        name: 'GGG favorite',
        parentId: 'root',
        createdAt: '2026-06-22T00:00:00.000Z',
        modifiedAt: '2026-06-22T00:00:00.000Z',
        metadata: {
          id: 'ggg123',
          url: 'https://www.pathofexile.com/trade2/search/poe2/Runes%20of%20Aldur/ggg123'
        }
      }
    ];
    googleDriveFiles.set('favoriteFolders_v2-file-id', JSON.stringify(favoriteEntries));

    const localStore: StorageStore = {
      poe2trade_storage_version: 5,
      searchHistory: []
    };
    const syncStore: StorageStore = {
      poe2trade_settings_favoriteGDriveSyncEnabled: true,
      '__gdrive_hint__:favoriteFolders_v2': {
        fileId: 'favoriteFolders_v2-file-id',
        lastModified: '2026-06-22T00:00:00.000Z'
      }
    };

    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        runtime: {
          lastError: undefined
        },
        storage: {
          local: createStorageArea(localStore),
          sync: createStorageArea(syncStore)
        }
      }
    });

    const { executeLegacyVersionMigrations } = await import('./legacyVersionManager');

    await executeLegacyVersionMigrations();

    const migratedFavorites = JSON.parse(
      googleDriveFiles.get('favoriteFolders_v2-file-id')!
    ) as Array<{ id: string; metadata?: { url: string } }>;

    expect(migratedFavorites.find(entry => entry.id === 'favorite-daum')?.metadata?.url).toBe(
      'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/abc123'
    );
    expect(migratedFavorites.find(entry => entry.id === 'favorite-ggg')?.metadata?.url).toBe(
      'https://www.pathofexile.com/trade2/search/poe2/Runes%20of%20Aldur/ggg123'
    );
    expect(localStore.poe2trade_storage_version).toBe(6);
  });

  test('keeps Google Drive favorites unchanged and retries when Drive read fails', async () => {
    const favoriteEntries = [
      {
        id: 'root',
        type: 'folder',
        name: '/',
        parentId: null,
        createdAt: '2026-06-22T00:00:00.000Z',
        modifiedAt: '2026-06-22T00:00:00.000Z'
      },
      {
        id: 'favorite-daum',
        type: 'file',
        name: 'Daum legacy favorite',
        parentId: 'root',
        createdAt: '2026-06-22T00:00:00.000Z',
        modifiedAt: '2026-06-22T00:00:00.000Z',
        metadata: {
          id: 'abc123',
          url: 'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur/abc123'
        }
      }
    ];
    const originalContent = JSON.stringify(favoriteEntries);
    googleDriveFiles.set('favoriteFolders_v2-file-id', originalContent);
    googleDriveReadFailures.add('favoriteFolders_v2-file-id');

    const localStore: StorageStore = {
      poe2trade_storage_version: 5,
      searchHistory: []
    };
    const syncStore: StorageStore = {
      poe2trade_settings_favoriteGDriveSyncEnabled: true,
      '__gdrive_hint__:favoriteFolders_v2': {
        fileId: 'favoriteFolders_v2-file-id',
        lastModified: '2026-06-22T00:00:00.000Z'
      }
    };

    Object.defineProperty(globalThis, 'chrome', {
      configurable: true,
      value: {
        runtime: {
          lastError: undefined
        },
        storage: {
          local: createStorageArea(localStore),
          sync: createStorageArea(syncStore)
        }
      }
    });

    const { executeLegacyVersionMigrations } = await import('./legacyVersionManager');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await executeLegacyVersionMigrations();

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(googleDriveFiles.get('favoriteFolders_v2-file-id')).toBe(originalContent);
    expect(localStore.poe2trade_storage_version).toBe(5);

    consoleErrorSpy.mockRestore();
    googleDriveReadFailures.clear();

    await executeLegacyVersionMigrations();

    const migratedFavorites = JSON.parse(
      googleDriveFiles.get('favoriteFolders_v2-file-id')!
    ) as Array<{ id: string; metadata?: { url: string } }>;

    expect(migratedFavorites.find(entry => entry.id === 'favorite-daum')?.metadata?.url).toBe(
      'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/abc123'
    );
    expect(localStore.poe2trade_storage_version).toBe(6);
  });
});
