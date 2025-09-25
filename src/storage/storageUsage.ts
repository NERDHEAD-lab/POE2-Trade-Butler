import { getMessage } from '../utils/_locale';
import {
  getAllStorageItems,
  getStorageDefinitions,
  StorageManager,
  StorageType,
  STORAGE_TYPES, createStorageStrategy
} from './storage';

export interface StorageEntryUsage {
  key: string;
  size: number;
  size_f: string;
  isDefined: boolean;
  description: string;
}

export interface StorageTypeUsage {
  entities: StorageEntryUsage[];
  totalSize: number;
  totalSize_f: string;
}

type UsageInfoFormatted = {
  [K in StorageType]: StorageTypeUsage;
};

export async function usageInfo(
  storageManager: StorageManager<unknown>
): Promise<StorageEntryUsage> {
  const info = await usageInfoAll();

  return (
    info[storageManager.type]?.entities.find(entry => entry.key === storageManager.key) || {
      key: storageManager.key,
      size: 0,
      size_f: '0.00B',
      isDefined: false,
      description: getStorageDescription(storageManager.key)
    }
  );
}

export async function usageInfoAll(): Promise<UsageInfoFormatted> {
  const result = {} as UsageInfoFormatted;
  const storageDefinitions = getStorageDefinitions();

  for (const type of STORAGE_TYPES) {
    const entities = await getAllStorageItems(type);
    if (!entities || Object.keys(entities).length === 0) {
      continue;
    }

    let totalSize = 0;
    const formattedEntities: StorageEntryUsage[] = [];

    for (let key in entities) {
      let entity: unknown;

      function isChunkStorage(key: string): boolean {
        // __chunk__:${this.key}::_part_${index}
        return /^__chunk__:.+::_part_\d+$/.test(key);
      }

      function isChunkMilestone(key: string): boolean {
        // __chunk__:${this.key}::__meta
        return /^__chunk__:.+::__meta$/.test(key);
      }

      if (isChunkStorage(key)) {
        continue; // Skip chunk keys
      } else if(isChunkMilestone(key)) {
        key = key
          .replace(/^__chunk__:/, '')
          .replace(/::__meta$/, '');
        entity = await createStorageStrategy(type, key, () => ({}), 'chunkedArray').get();
      } else {
        entity = entities[key];
      }

      const isDefined = storageDefinitions.some(def => def.type === type && def.key === key);
      const description = getStorageDescription(isDefined ? key : 'unknown_key');
      const size = getEncodedSize({ [key]: entity });
      const formattedSize = formatFileSize(size);

      totalSize += size;

      formattedEntities.push({
        key,
        size,
        size_f: formattedSize,
        isDefined,
        description
      });
    }

    formattedEntities.sort((a, b) => b.size - a.size);

    result[type] = {
      entities: formattedEntities,
      totalSize,
      totalSize_f: formatFileSize(totalSize)
    };
  }

  return result;
}

function getEncodedSize(data: unknown): number {
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(data)).length;
}

function getStorageDescription(key: string): string {
  const description = getMessage(`storage_description_${key}`);
  if (!description && process.env.NODE_ENV === 'development') {
    console.warn(`No i18n description found for 'storage_description_${key}'`);
  }
  return description;
}

export function formatFileSize(size: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  for (let i = 0; i < units.length; i++) {
    if (size < 1024 || i === units.length - 1) {
      return `${size.toFixed(2)}${units[i]}`;
    }
    size /= 1024;
  }

  return '0.00B';
}
