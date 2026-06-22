import { jest } from '@jest/globals';

type Deferred = {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error: unknown) => void;
};

function createDeferred(): Deferred {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

async function flushMicrotasks(): Promise<void> {
  for (let i = 0; i < 20; i++) {
    await Promise.resolve();
  }
  await new Promise(resolve => setTimeout(resolve, 0));
}

let flushDeferred = createDeferred();

const flushI18n = jest.fn(() => flushDeferred.promise);
const executeLegacyVersionMigrations = jest.fn(async () => undefined);
const cleanExpiredOrphanSnapshots = jest.fn(async () => undefined);
const getCachedCheckVersion = jest.fn(async () => ({
  installedVersion: '3.0.1',
  latestVersion: '3.0.1',
  versionType: 'DEV'
}));
const usageInfoAll = jest.fn(async () => ({}));
const addSearchHistoryDeletedListener = jest.fn();
const addFavoriteDeletedListener = jest.fn();
const getNoticeContext = jest.fn(async () => ({ lastModified: '', content: '' }));
const setNoticeContext = jest.fn(async () => undefined);

jest.unstable_mockModule('./storage/settingStorage', () => ({
  flushI18n,
  getNoticeContext,
  setNoticeContext
}));

jest.unstable_mockModule('./storage/legacy/legacyVersionManager', () => ({
  executeLegacyVersionMigrations
}));

jest.unstable_mockModule('./storage/previewStorage', () => ({
  cleanExpiredOrphanSnapshots
}));

jest.unstable_mockModule('./utils/versionChecker', () => ({
  getCachedCheckVersion
}));

jest.unstable_mockModule('./storage/storageUsage', () => ({
  usageInfoAll
}));

jest.unstable_mockModule('./storage/searchHistoryStorage', () => ({
  addOnDeletedListener: addSearchHistoryDeletedListener
}));

jest.unstable_mockModule('./storage/favoriteStorage', () => ({
  addOnDeletedListener: addFavoriteDeletedListener
}));

jest.unstable_mockModule('marked', () => ({
  marked: {
    parse: jest.fn((content: string) => content)
  }
}));

type InstalledListener = (details: chrome.runtime.InstalledDetails) => void;

function installChromeMock(): {
  onInstalledListeners: InstalledListener[];
  onInstalledAddListener: ReturnType<typeof jest.fn>;
} {
  const onInstalledListeners: InstalledListener[] = [];
  const onInstalledAddListener = jest.fn((listener: InstalledListener) => {
    onInstalledListeners.push(listener);
  });

  Object.defineProperty(globalThis, 'chrome', {
    configurable: true,
    value: {
      runtime: {
        lastError: undefined,
        getManifest: () => ({ version: '3.0.1' }),
        onConnect: { addListener: jest.fn() },
        onMessage: { addListener: jest.fn() },
        onStartup: { addListener: jest.fn() },
        onInstalled: { addListener: onInstalledAddListener },
        onUpdateAvailable: { addListener: jest.fn() }
      },
      action: {
        setBadgeText: jest.fn(),
        setBadgeBackgroundColor: jest.fn(),
        setIcon: jest.fn()
      },
      identity: {
        getAuthToken: jest.fn(),
        removeCachedAuthToken: jest.fn()
      }
    }
  });

  return { onInstalledListeners, onInstalledAddListener };
}

describe('background maintenance startup', () => {
  beforeEach(() => {
    flushDeferred = createDeferred();
    flushI18n.mockImplementation(() => flushDeferred.promise);
    executeLegacyVersionMigrations.mockResolvedValue(undefined);
    cleanExpiredOrphanSnapshots.mockResolvedValue(undefined);
    getCachedCheckVersion.mockResolvedValue({
      installedVersion: '3.0.1',
      latestVersion: '3.0.1',
      versionType: 'DEV'
    });
    usageInfoAll.mockResolvedValue({});
    getNoticeContext.mockResolvedValue({ lastModified: '', content: '' });
    setNoticeContext.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    flushDeferred.resolve();
    await flushMicrotasks();
    Reflect.deleteProperty(globalThis, 'chrome');
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('registers the installed listener before maintenance resolves', async () => {
    const { onInstalledAddListener } = installChromeMock();

    await import('./background');

    expect(flushI18n).toHaveBeenCalled();
    expect(onInstalledAddListener).toHaveBeenCalledTimes(1);
  });

  test('runs maintenance when the extension is updated', async () => {
    flushI18n.mockResolvedValue(undefined);
    const { onInstalledListeners } = installChromeMock();

    await import('./background');
    await flushMicrotasks();

    expect(onInstalledListeners).toHaveLength(1);

    flushI18n.mockClear();
    executeLegacyVersionMigrations.mockClear();
    cleanExpiredOrphanSnapshots.mockClear();

    onInstalledListeners[0]({
      reason: 'update' as chrome.runtime.OnInstalledReason,
      previousVersion: '3.0.0',
      id: 'ipnemofnhodcgcplnnfekbfpmngeeocm'
    });
    await flushMicrotasks();

    expect(flushI18n).toHaveBeenCalledTimes(1);
    expect(executeLegacyVersionMigrations).toHaveBeenCalledTimes(1);
    expect(cleanExpiredOrphanSnapshots).toHaveBeenCalledTimes(1);
  });

  test('does not start duplicate maintenance while initial maintenance is pending', async () => {
    const { onInstalledListeners } = installChromeMock();

    await import('./background');

    expect(onInstalledListeners).toHaveLength(1);
    expect(flushI18n).toHaveBeenCalledTimes(1);

    onInstalledListeners[0]({
      reason: 'update' as chrome.runtime.OnInstalledReason,
      previousVersion: '3.0.0',
      id: 'ipnemofnhodcgcplnnfekbfpmngeeocm'
    });
    await flushMicrotasks();

    expect(flushI18n).toHaveBeenCalledTimes(1);
    expect(executeLegacyVersionMigrations).not.toHaveBeenCalled();

    flushDeferred.resolve();
    await flushMicrotasks();

    expect(executeLegacyVersionMigrations).toHaveBeenCalledTimes(1);
    expect(cleanExpiredOrphanSnapshots).toHaveBeenCalledTimes(1);
  });
});
