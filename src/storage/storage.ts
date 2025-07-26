import { getMessage } from '../utils/_locale';

const StorageTypeEnum = {
  local: {
    module: chrome.storage.local,
    description: 'Local storage'
  },
  sync: {
    module: chrome.storage.sync,
    description: 'Sync storage'
  },
  session: {
    module: chrome.storage.session,
    description: 'Session-only storage'
  }
} as const;

export type StorageType = keyof typeof StorageTypeEnum;

export interface StorageDefinition<VALUE_TYPE> {
  type: StorageType;
  key: string;
  description: string;

  __type?: VALUE_TYPE; // For TypeScript type inference, not used at runtime
}

const storageDefinitions: Record<string, StorageDefinition<unknown>> = {};

function defineStorage<T>(type: StorageType, key: string): StorageDefinition<T> {
  if (storageDefinitions[key]) {
    throw new Error(`Storage key "${key}" is already defined. Please use a unique key.`);
  }

  const description = getMessage(`storage_definition_${key}`);
  if (!description) {
    console.warn(`No description found for storage key: ${key}`);
  }

  const definition: StorageDefinition<T> = {
    type,
    key,
    description,

    __type: undefined // Placeholder for TypeScript type inference
  };
  storageDefinitions[key] = definition;
  return definition;
}

export class StorageManager<ENTITY> {
  private readonly definition: StorageDefinition<ENTITY>;
  private readonly defaultValueSupplier: () => ENTITY;

  constructor(type: StorageType, key: string, defaultValueSupplier?: () => ENTITY) {
    this.definition = defineStorage(type, key);
    this.defaultValueSupplier = defaultValueSupplier || (() => null as ENTITY);
  }

  async set(value: ENTITY): Promise<void> {
    return set(this.definition.type, this.definition.key, value);
  }

  async get(): Promise<ENTITY> {
    return get(this.definition.type, this.definition.key, this.defaultValueSupplier());
  }

  async usageInfo(): Promise<{ key: string; totalSize: number }> {
    const info = await usageInfoAll();
    return (
      info[this.definition.type].find(item => item.key === this.definition.key) || {
        key: this.definition.key,
        totalSize: 0
      }
    );
  }

  addOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    addOnChangeListener(this.definition.type, this.definition.key, listener);
  }

  removeOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    removeOnChangeListener(this.definition.type, listener);
  }
}

function set<T>(storageType: StorageType, key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const storageObj = StorageTypeEnum[storageType].module;
    storageObj.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

function get<T>(storageType: StorageType, key: string, defaultValue: T): Promise<T> {
  return new Promise((resolve, reject) => {
    const storageObj = StorageTypeEnum[storageType].module;
    storageObj.get(key, result => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      }
    });
  });
}

export async function usageInfoAll(): Promise<{
  [K in StorageType]: Array<{ key: string; totalSize: number }>;
}> {
  const result = {} as {
    [K in StorageType]: Array<{ key: string; totalSize: number }>;
  };

  const storageTypes = Object.keys(StorageTypeEnum) as StorageType[];

  for (const type of storageTypes) {
    const allItems = await getAllStorageItems(type);
    result[type] = Object.entries(allItems).map(([key, value]) => ({
      key,
      totalSize: getEncodedSize({ [key]: value })
    }));
  }

  return result;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const listenerMap = new WeakMap<
  (newValue: any, oldValue: any) => void,
  (changes: { [key: string]: chrome.storage.StorageChange }) => void
>();

/* eslint-enable @typescript-eslint/no-explicit-any */

function addOnChangeListener<T>(
  storageType: StorageType,
  key: string,
  listener: (newValue: T, oldValue: T) => void
): void {
  const storageObj = StorageTypeEnum[storageType].module;

  const changeListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    const change = changes[key];
    if (change) {
      listener(change.newValue as T, change.oldValue as T);
    }
  };

  listenerMap.set(listener, changeListener);
  storageObj.onChanged.addListener(changeListener);
}

function removeOnChangeListener<T>(
  storageType: StorageType,
  listener: (newValue: T, oldValue: T) => void
): void {
  const storageObj = StorageTypeEnum[storageType].module;
  const changeListener = listenerMap.get(listener);
  if (changeListener) {
    storageObj.onChanged.removeListener(changeListener);
    listenerMap.delete(listener);
  }
}

function getAllStorageItems(storageType: StorageType): Promise<Record<string, unknown>> {
  const storageObj = StorageTypeEnum[storageType].module;

  return new Promise((resolve, reject) => {
    storageObj.get(null, items => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(items);
      }
    });
  });
}

function getEncodedSize(data: unknown): number {
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(data)).length;
}
