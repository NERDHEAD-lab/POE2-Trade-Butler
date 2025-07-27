import { getMessage } from '../utils/_locale';
import { getAllStorageItems, getStorageDefinitions, StorageManager, StorageType } from './storage';

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
  [K in StorageType]: Array<{ key: string; totalSize: number, description?: string }>;
}> {
  const result = {} as {
    [K in StorageType]: Array<{ key: string; totalSize: number, description?: string }>;
  };

  const storageDefinitions = getStorageDefinitions();
  for (const definition of storageDefinitions) {
    const type = definition.type;

    const data = await chrome.storage[definition.type].get(definition.key);
    const totalSize = getEncodedSize({ [definition.key]: data });
    const description = getStorageDescription(definition.key);

    if (!result[type]) {
      result[type] = [];
    }
    result[type].push({
      key: definition.key,
      totalSize,
      description
    });
  }

  // storageDefinitions의 key들을 제외한 나머지
  const storageTypes = (['local', 'sync', 'session'] as StorageType[]);
  for (const type of storageTypes) {

    const entities = await getAllStorageItems(type);
    for (const key in entities) {
      if (!result[type].some(item => item.key === key)) {
        const totalSize = getEncodedSize({ [key]: entities[key] });
        const description = getStorageDescription('unknown_key');
        result[type].push({
          key,
          totalSize,
          description
        });
      }
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