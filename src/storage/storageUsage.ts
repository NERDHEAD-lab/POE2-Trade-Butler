import { getMessage } from '../utils/_locale';
import { getAllStorageItems, getStorageDefinitions, StorageManager, StorageType, STORAGE_TYPES } from './storage';

export async function usageInfo(storageManager: StorageManager<unknown>): Promise<{
  key: string;
  totalSize: number;
  description?: string;
}> {
  const info = await usageInfoAll();

  return info[storageManager.type].find(item => item.key === storageManager.key) || {
    key: storageManager.key,
    totalSize: 0,
    description: getStorageDescription(storageManager.key)
  };
}

export async function usageInfoAll(): Promise<{
  [K in StorageType]: Array<{ key: string; totalSize: number; description?: string }>;
}> {
  const result = {} as {
    [K in StorageType]: Array<{ key: string; totalSize: number; description?: string }>;
  };

  const storageDefinitions = getStorageDefinitions();

  for (const type of STORAGE_TYPES) {
    result[type] = [];

    const entities = await getAllStorageItems(type);

    for (const key in entities) {
      const isDefined = storageDefinitions.some(def => def.type === type && def.key === key);
      const description = getStorageDescription(isDefined ? key : 'unknown_key');
      const totalSize = getEncodedSize({ [key]: entities[key] });

      result[type].push({ key, totalSize, description });
    }
  }

  return result;
}

function getEncodedSize(data: unknown): number {
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(data)).length;
}

function getStorageDescription(key: string): string | undefined {
  const description = getMessage(`storage_description_${key}`);
  if (!description && process.env.NODE_ENV === 'development') {
    console.warn(`No i18n description found for 'storage_description_${key}'`);
  }
  return description;
}