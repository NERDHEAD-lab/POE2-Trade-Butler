const StorageTypeEnum = {
  local: {
    module: chrome.storage.local,
    description: 'Local storage'
  },
  sync: {
    module: chrome.storage.sync,
    description: 'Sync storage'
  } /*,
  session: {
    module: chrome.storage.session,
    description: 'Session-only storage'
  }*/
} as const;

export type StorageType = keyof typeof StorageTypeEnum;
export const STORAGE_TYPES = Object.keys(StorageTypeEnum) as StorageType[];

class StorageDefinition<VALUE_TYPE> {
  constructor(
    public type: StorageType,
    public key: string
  ) {}

  // 타입 추론용
  __type?: VALUE_TYPE;
}

const storageDefinitions: StorageDefinition<unknown>[] = [];

function defineStorage<T>(type: StorageType, key: string): StorageDefinition<T> {
  if (storageDefinitions.some(def => def.key === key)) {
    throw new Error(`Storage key "${key}" is already defined. Please use a unique key.`);
  }

  const definition: StorageDefinition<T> = new StorageDefinition<T>(type, key);

  storageDefinitions.push(definition);
  return definition;
}

export function getStorageDefinitions(): StorageDefinition<unknown>[] {
  return storageDefinitions;
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

  get type(): StorageType {
    return this.definition.type;
  }

  get key(): string {
    return this.definition.key;
  }

  async get(): Promise<ENTITY> {
    return get(this.definition.type, this.definition.key, this.defaultValueSupplier());
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

// returns { [key: string]: value: unknown }
export function getAllStorageItems(storageType: StorageType): Promise<Record<string, unknown>> {
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
