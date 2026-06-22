import { expect, test, chromium, type BrowserContext, type Worker } from '@playwright/test';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '../..');
const distPath = path.join(repoRoot, 'dist');

const DAUM_URL = 'https://poe.game.daum.net/trade2/search/poe2/Runes%20of%20Aldur/seeddaum1';
const KAKAO_URL = 'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/seeddaum1';
const GGG_URL = 'https://www.pathofexile.com/trade2/search/poe2/Runes%20of%20Aldur/seedggg1';

type SearchHistorySnapshot = {
  url: string;
};

type FavoriteEntrySnapshot = {
  id: string;
  metadata?: {
    url: string;
  };
};

type StorageSnapshot = {
  local: {
    poe2trade_storage_version?: number;
    searchHistory?: SearchHistorySnapshot[];
  };
  sync: {
    '__chunk__:favoriteFolders::_part_0'?: FavoriteEntrySnapshot[];
    '__gdrive_hint__:favoriteFolders_v2'?: unknown;
    poe2trade_settings_favoriteGDriveSyncEnabled?: boolean;
  };
};

test('migrates legacy Daum local and sync storage without Google Drive', async () => {
  const extensionId = await getExtensionId();
  const userDataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'poe2tb-e2e-'));

  const seededContext = await launchExtension(userDataDir);
  const seededWorker = await waitForExtensionWorker(seededContext, extensionId);
  const seeded = await seedLegacyDaumStorage(seededWorker);

  expect(seeded.local.poe2trade_storage_version).toBe(5);
  expect(seeded.local.searchHistory?.[0]?.url).toBe(DAUM_URL);
  expect(findFavoriteUrl(seeded, 'favorite-daum-seed')).toBe(DAUM_URL);
  expect(seeded.sync['__gdrive_hint__:favoriteFolders_v2']).toBeUndefined();
  await seededContext.close();

  const migratedContext = await launchExtension(userDataDir);
  const migratedWorker = await waitForExtensionWorker(migratedContext, extensionId);
  const migrated = await waitForMigratedStorage(migratedWorker);

  expect(migrated.local.poe2trade_storage_version).toBe(6);
  expect(migrated.local.searchHistory?.[0]?.url).toBe(KAKAO_URL);
  expect(findFavoriteUrl(migrated, 'favorite-daum-seed')).toBe(KAKAO_URL);
  expect(findFavoriteUrl(migrated, 'favorite-ggg-seed')).toBe(GGG_URL);
  expect(migrated.sync['__gdrive_hint__:favoriteFolders_v2']).toBeUndefined();
  expect(migrated.sync.poe2trade_settings_favoriteGDriveSyncEnabled).toBe(false);

  await migratedContext.close();
});

async function launchExtension(userDataDir: string): Promise<BrowserContext> {
  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [`--disable-extensions-except=${distPath}`, `--load-extension=${distPath}`]
  });
}

async function getExtensionId(): Promise<string> {
  const manifestPath = path.join(distPath, 'manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')) as { key?: string };
  if (!manifest.key) {
    throw new Error('dist/manifest.json does not contain manifest.key. Run npm run build:dev first.');
  }

  const hash = crypto.createHash('sha256').update(Buffer.from(manifest.key, 'base64')).digest();
  return [...hash.subarray(0, 16)]
    .map(byte => [byte >> 4, byte & 15].map(nibble => String.fromCharCode(97 + nibble)).join(''))
    .join('');
}

async function waitForExtensionWorker(context: BrowserContext, extensionId: string): Promise<Worker> {
  const workerUrlPrefix = `chrome-extension://${extensionId}/`;
  const existingWorker = context.serviceWorkers().find(worker => worker.url().startsWith(workerUrlPrefix));
  if (existingWorker) return existingWorker;

  const worker = await context.waitForEvent('serviceworker');
  expect(worker.url()).toContain(workerUrlPrefix);
  return worker;
}

async function seedLegacyDaumStorage(worker: Worker): Promise<StorageSnapshot> {
  return worker.evaluate(
    async ({ daumUrl, gggUrl }) => {
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
          id: 'favorite-daum-seed',
          type: 'file',
          name: 'Daum legacy favorite seed',
          parentId: 'root',
          createdAt: '2026-06-22T00:00:00.000Z',
          modifiedAt: '2026-06-22T00:00:00.000Z',
          metadata: {
            id: 'seeddaum1',
            url: daumUrl
          }
        },
        {
          id: 'favorite-ggg-seed',
          type: 'file',
          name: 'GGG favorite seed',
          parentId: 'root',
          createdAt: '2026-06-22T00:00:00.000Z',
          modifiedAt: '2026-06-22T00:00:00.000Z',
          metadata: {
            id: 'seedggg1',
            url: gggUrl
          }
        }
      ];

      await chrome.storage.local.clear();
      await chrome.storage.sync.clear();
      await chrome.storage.local.set({
        poe2trade_storage_version: 5,
        searchHistory: [
          {
            id: 'seeddaum1',
            url: daumUrl,
            lastSearched: '2026-06-22T00:00:00.000Z',
            previousSearches: []
          }
        ]
      });
      await chrome.storage.sync.set({
        poe2trade_settings_favoriteGDriveSyncEnabled: false,
        '__chunk__:favoriteFolders::__meta': {
          v: 1,
          parts: 1,
          chunkSize: 7500,
          originalSize: JSON.stringify(favoriteEntries).length
        },
        '__chunk__:favoriteFolders::_part_0': favoriteEntries
      });

      const local = await chrome.storage.local.get(['poe2trade_storage_version', 'searchHistory']);
      const sync = await chrome.storage.sync.get([
        'poe2trade_settings_favoriteGDriveSyncEnabled',
        '__chunk__:favoriteFolders::_part_0',
        '__gdrive_hint__:favoriteFolders_v2'
      ]);

      return { local, sync };
    },
    { daumUrl: DAUM_URL, gggUrl: GGG_URL }
  );
}

async function waitForMigratedStorage(worker: Worker): Promise<StorageSnapshot> {
  return expect
    .poll(async () => readStorageSnapshot(worker))
    .toMatchObject({
      local: {
        poe2trade_storage_version: 6,
        searchHistory: [{ url: KAKAO_URL }]
      }
    })
    .then(async () => readStorageSnapshot(worker));
}

async function readStorageSnapshot(worker: Worker): Promise<StorageSnapshot> {
  return worker.evaluate(async () => {
    const local = await chrome.storage.local.get(['poe2trade_storage_version', 'searchHistory']);
    const sync = await chrome.storage.sync.get([
      'poe2trade_settings_favoriteGDriveSyncEnabled',
      '__chunk__:favoriteFolders::_part_0',
      '__gdrive_hint__:favoriteFolders_v2'
    ]);

    return { local, sync };
  });
}

function findFavoriteUrl(snapshot: StorageSnapshot, id: string): string | undefined {
  return snapshot.sync['__chunk__:favoriteFolders::_part_0']?.find(entry => entry.id === id)?.metadata
    ?.url;
}
