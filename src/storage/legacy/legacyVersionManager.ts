import { StorageManager, StorageType } from '../storage';
import { getMessage } from '../../utils/_locale';
import * as storageUsage from '../storageUsage';

/* eslint-disable @typescript-eslint/no-explicit-any */
const CURRENT_STORAGE_VERSION_KEY = 'poe2trade_storage_version';
const CURRENT_STORAGE_VERSION = 3;

const versionStorage: StorageManager<number> = new StorageManager(
  'local',
  CURRENT_STORAGE_VERSION_KEY,
  () => 0
);

interface LegacyVersionMigrator<LEGACY> {
  key: string;
  storageType: StorageType;
  version: number;
  migrate?: (legacy: LEGACY) => Promise<void>;
  removeAfter?: boolean;
  description: string;
}

const legacyVersionMigrators: LegacyVersionMigrator<any>[] = [
  {
    key: 'searchHistory',
    storageType: 'local',
    version: 1,
    migrate: async (legacy: SearchHistoryEntity_v1[]) => {
      const currentEntity: SearchHistoryEntity_v2[] = [];
      const currentPreviewData: Record<string, PreviewPanelSnapshot_v2> = {};

      legacy.forEach(entry => {
        currentEntity.push({
          id: entry.id,
          url: entry.url,
          lastSearched: entry.lastSearched,
          previousSearches: entry.previousSearches
        });

        if (!entry.etc?.previewInfo) return;
        const previewData = entry.etc.previewInfo;

        currentPreviewData[entry.id] = {
          searchKeyword: previewData.searchKeyword,
          outerHTML: previewData.outerHTML,
          attributes: previewData.attributes,
          timestamp: previewData.timestamp
        };
      });

      await chrome.storage.local.set({ ['searchHistory']: currentEntity }); // Remove old v1 storage
      await chrome.storage.local.set({ ['previewPanelSnapshots']: currentPreviewData }); // Save preview data
    },
    description:
      'Migrate search history from v1 to v2 format, extracting history entries and preview data.'
  },
  {
    key: 'favoriteFolders',
    storageType: 'local',
    version: 1,
    migrate: async (legacy: FavoriteFolderRoot_v1) => {
      const root = DEFAULT_FAVORITE_ROOT();
      const currentEntities: FileSystemEntry_2[] = [root];
      const currentPreviewData: Record<string, PreviewPanelSnapshot_v2> = {};

      function exportFile(entry: FavoriteItem_v1, parentId: string): void {
        const result: FileSystemEntry_2 = {
          id: crypto.randomUUID(),
          name: entry.name || entry.id,
          type: 'file',
          parentId: parentId,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString(),
          metadata: { id: entry.id, url: entry.url }
        };

        currentEntities.push(result);

        if (!entry.etc?.previewInfo) return;
        const previewData = entry.etc.previewInfo;

        currentPreviewData[entry.id] = {
          searchKeyword: previewData.searchKeyword,
          outerHTML: previewData.outerHTML,
          attributes: previewData.attributes,
          timestamp: previewData.timestamp
        };
      }

      function exportFolder(entry: FavoriteFolder_v1, parentId: string): void {
        const result: FolderEntry_2 = {
          id: crypto.randomUUID(),
          name: entry.name,
          type: 'folder',
          parentId: parentId,
          createdAt: new Date().toISOString(),
          modifiedAt: new Date().toISOString()
        };
        currentEntities.push(result);

        if (entry.folders) {
          entry.folders.forEach(subFolder => exportFolder(subFolder, result.id));
        }
        if (entry.items) {
          entry.items.forEach(item => exportFile(item, result.id));
        }
      }

      legacy.items?.forEach(item => exportFile(item, root.id));
      legacy.folders?.forEach(folder => exportFolder(folder, root.id));

      await chrome.storage.local.remove('favoriteFolders'); // Remove old v1 storage
      await chrome.storage.sync.set({ ['favoriteFolders']: currentEntities }); // Save as v2 format
      await chrome.storage.local.set({ ['previewPanelSnapshots']: currentPreviewData }); // Save preview data
    },
    description: 'Migrate favorite folders from v1 to v2 format, ensuring root folder structure.'
  },
  {
    key: 'lscache-trade2items',
    storageType: 'local',
    version: 2,
    removeAfter: true,
    description:
      'Remove legacy lscache-trade2items cache data from local storage. This data is no longer used in the current version.'
  },
  {
    key: 'lscache-trade2filters',
    storageType: 'local',
    version: 2,
    removeAfter: true,
    description:
      'Remove legacy lscache-trade2filters cache data from local storage. This data is no longer used in the current version.'
  },
  {
    key: 'lscache-trade2stats',
    storageType: 'local',
    version: 2,
    removeAfter: true,
    description:
      'Remove legacy lscache-trade2stats cache data from local storage. This data is no longer used in the current version.'
  },
  {
    key: 'lscache-trade2data',
    storageType: 'local',
    version: 2,
    removeAfter: true,
    description:
      'Remove legacy lscache-trade2data cache data from local storage. This data is no longer used in the current version.'
  },
  {
    key: 'favoriteFolders',
    storageType: 'local',
    version: 2,
    removeAfter: true,
    description:
      'Remove legacy favoriteFolders data from local storage. This data is no longer used in the current version.'
  },
  {
    key: 'version-check',
    storageType: 'local',
    version: 2,
    removeAfter: true,
    description:
      'Remove legacy version-check data from local storage. This data is no longer used in the current version.'
  }
] satisfies LegacyVersionMigrator<any>[];

// CURRENT_STORAGE_VERSION 보다 작은 버전의 마이그레이터를 순서대로 실행
export async function executeLegacyVersionMigrations(): Promise<void> {
  const currentVersion = await getCurrentStorageVersion();
  if (CURRENT_STORAGE_VERSION <= currentVersion) {
    return;
  }

  legacyVersionMigrators.sort((a, b) => a.version - b.version);

  console.log(
    getMessage('log_migration_start', currentVersion.toString(), CURRENT_STORAGE_VERSION.toString())
  );
  for (const migrator of legacyVersionMigrators) {
    if (migrator.version >= currentVersion && migrator.version < CURRENT_STORAGE_VERSION) {
      try {
        await executeMigration(migrator);
      } catch (error) {
        let msg: string;

        if (error instanceof Error) {
          msg = error.message;
        } else if (typeof error === 'string') {
          msg = error;
        } else {
          msg = JSON.stringify(error);
        }
        console.error(getMessage('error_migration_failed', migrator.version.toString(), msg));
      }
    }
  }

  // 마이그레이션 완료 후 현재 버전 업데이트
  await versionStorage.set(CURRENT_STORAGE_VERSION);
}

function getCurrentStorageVersion(): Promise<number> {
  return new Promise(resolve => {
    versionStorage.get().then(version => resolve(version));
  });
}

async function executeMigration(migrator: LegacyVersionMigrator<any>): Promise<void> {
  const storageType = migrator.storageType;
  const key = migrator.key;

  try {
    // const legacyData = await storage.get(storageType, key, []);
    const legacyData = await chrome.storage[storageType]
      .get(key)
      .then(result => result[key] || null);

    console.log(getMessage('log_migration_key', key, storageType));
    if (legacyData && migrator.migrate) {
      await migrator.migrate(legacyData);
    } else {
      console.log(getMessage('warn_no_data_for_migration', migrator.description));
    }

    if (migrator.removeAfter) {
      if (!(await isStoredButUndefined(storageType, key))) {
        // 이미 없거나, 정의되어 있는(사용 중인) 경우 스킵
        console.log(getMessage('log_migration_skip_remove', key, storageType));
        return;
      }
      await chrome.storage[storageType].remove(key);
      console.log(getMessage('log_migration_remove_old_data', key, storageType));
    }

    console.log(getMessage('log_migration_completed', migrator.description));
  } catch (error) {
    let msg: string;

    if (error instanceof Error) {
      msg = error.message;
    } else if (typeof error === 'string') {
      msg = error;
    } else {
      msg = JSON.stringify(error);
    }
    console.error(getMessage('error_migration_description_failed', migrator.description, msg));
    throw error;
  }
}

// type과 key로 조회는 되지만, isDefined가 false인 경우, storageManager를 통해 정의된 키가 아니므로 undefined로 간주
async function isStoredButUndefined(storageType: StorageType, key: string): Promise<boolean> {
  const usage = await storageUsage.usageInfoAll();

  const typeUsage = usage[storageType];
  if (!typeUsage) return false;

  const entry = typeUsage.entities.find(e => e.key === key);
  if (!entry) return false;

  return !entry.isDefined;
}

/* ****************************************************************************** */
/* Legacy Version Manager for Poe2Trade Storage ********************************* */

/* ****************************************************************************** */
interface SearchHistoryEntity_v1 {
  id: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
  etc?: Record<string, any>;
}

interface SearchHistoryEntity_v2 {
  id: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
}

export interface PreviewPanelSnapshot_v2 {
  searchKeyword: string;
  outerHTML: string;
  attributes: { [key: string]: string };
  timestamp: number;
}

export interface FavoriteFolderRoot_v1 {
  name?: string;
  folders: FavoriteFolder_v1[];
  items: FavoriteItem_v1[];
}

export interface FavoriteItem_v1 {
  id: string; // SearchHistoryEntity.id
  name?: string; // 사용자 지정 별칭 (기본값: id)
  url: string; // SearchHistoryEntity.url
  etc?: Record<string, any>; // 기타 정보 (예: 프리뷰 데이터 등)
}

export interface FavoriteFolder_v1 {
  name: string; // 폴더 표시 이름
  folders?: FavoriteFolder_v1[]; // 하위 폴더
  items?: FavoriteItem_v1[]; // 포함된 즐겨찾기 항목
}

export type FileSystemEntry_2 = FileEntry_2 | FolderEntry_2;

interface BaseEntry_2 {
  readonly id: string;
  name: string;
  readonly type: 'file' | 'folder';
  parentId: string | null; // null이면 루트
  createdAt: string;
  modifiedAt: string;
}

interface FileEntry_2 extends BaseEntry_2 {
  readonly type: 'file';
  content?: string;
  metadata: Record<string, any>;
}

interface FolderEntry_2 extends BaseEntry_2 {
  readonly type: 'folder';
}

const DEFAULT_FAVORITE_ROOT: () => FolderEntry_2 = () => {
  return {
    id: 'root',
    type: 'folder',
    name: '/',
    parentId: null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
};
