import { get, set, StorageType, localStorage } from '../storage';

const CURRENT_STORAGE_VERSION_KEY = 'poe2trade_storage_version';
const CURRENT_STORAGE_VERSION = 2;

interface LegacyVersionMigrator<LEGACY> {
  key: string;
  storageType: StorageType;
  version: number;
  migrate: (legacy: LEGACY) => Promise<void>;
  description: string;
}


const legacyVersionMigrators: LegacyVersionMigrator<any>[] = [
  {
    key: 'searchHistory',
    storageType: 'local',
    version: 1,
    migrate: async (legacy:SearchHistoryEntity_v1[]) => {
      const currentEntity : SearchHistoryEntity_v2[] = [];
      const currentPreviewData: PreviewPanelSnapshot_v2[] = [];

      legacy
      .filter(entry => entry.etc && entry.etc.previewData)
      .forEach((entry) => {
        const etc = entry.etc!;
        const previewData = etc.previewData;

        currentEntity.push({
          id: entry.id,
          url: entry.url,
          lastSearched: entry.lastSearched,
          previousSearches: entry.previousSearches
        });

        currentPreviewData.push({
          searchKeyword: previewData.searchKeyword,
          outerHTML: previewData.outerHTML,
          attributes: previewData.attributes,
          timestamp: previewData.timestamp
        });
      });

      await set('local', 'searchHistory', currentEntity);
      await set('local', 'previewPanelSnapshots', currentPreviewData);
    },
    description: 'Migrate search history from v1 to v2 format, extracting preview data.'
  }
] satisfies LegacyVersionMigrator<any>[];

// CURRENT_STORAGE_VERSION 보다 작은 버전의 마이그레이터를 순서대로 실행
export async function executeLegacyVersionMigrations(): Promise<void> {
  const currentVersion = await getCurrentStorageVersion();
  if (CURRENT_STORAGE_VERSION <= currentVersion) {
    return;
  }

  legacyVersionMigrators.sort((a, b) => a.version - b.version);

  console.log(`Starting migrations from version ${currentVersion} to ${CURRENT_STORAGE_VERSION}`);
  for (const migrator of legacyVersionMigrators) {
    if (migrator.version > currentVersion && migrator.version <= CURRENT_STORAGE_VERSION) {
      try {
        await executeMigration(migrator);
      } catch (error) {
        console.error(`Migration failed for version ${migrator.version}:`, error);
      }
    }
  }

  // 마이그레이션 완료 후 현재 버전 업데이트
  await set('local', CURRENT_STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
}





function getCurrentStorageVersion(): Promise<number> {
  return new Promise((resolve) => {
    localStorage.get([CURRENT_STORAGE_VERSION_KEY], (result) => {
      resolve(result[CURRENT_STORAGE_VERSION_KEY] || 1);
    });
  });
}

function executeMigration(migrator: LegacyVersionMigrator<any>): Promise<void> {
  return new Promise((resolve, reject) => {
    const storage = migrator.storageType;
    const key = migrator.key;

    get(storage, key, [])
      .then((legacyData) => {
        if (legacyData && legacyData.length > 0) {
          return migrator.migrate(legacyData);
        } else {
          console.warn(`No data found for migration: ${migrator.description}`);
          return Promise.resolve();
        }
      })
      .then(() => {
        console.log(`Migration completed: ${migrator.description}`);
        resolve();
      })
      .catch((error) => {
        console.error(`Migration failed: ${migrator.description}`, error);
        reject(error);
      });
  });
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

const favoriteFolderRoot: FavoriteFolderRoot_v1 = {
  name: '/',
  folders: [],
  items: []
};

export interface FavoriteItem_v1 {
  id: string;       // SearchHistoryEntity.id
  name?: string;    // 사용자 지정 별칭 (기본값: id)
  url: string;      // SearchHistoryEntity.url
  etc?: Record<string, any>; // 기타 정보 (예: 프리뷰 데이터 등)
}

export interface FavoriteFolder_v1 {
  name: string;                   // 폴더 표시 이름
  folders?: FavoriteFolder_v1[];     // 하위 폴더
  items?: FavoriteItem_v1[];         // 포함된 즐겨찾기 항목
}