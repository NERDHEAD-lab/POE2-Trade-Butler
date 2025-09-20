import { ChunkifyUtil } from '../utils/ChunkifyUtil';
import { GoogleDriveApi } from '../utils/GoogleDriveApi';

const StorageTypeEnum: Record<'local' | 'sync', StorageTypeInfo> = {
  local: {
    module: chrome.storage.local,
    description: 'Local storage',
  },
  sync: {
    module: chrome.storage.sync,
    description: 'Sync storage',
  } /*,
  session: {
    module: chrome.storage.session,
    description: 'Session-only storage'
  }*/
};

interface StorageTypeInfo {
  module: chrome.storage.StorageArea;
  description: string;
}

type StorageStrategyType = 'default' | 'chunkedArray' | 'googleDrive';

interface StorageStrategy<ENTITY> {
  set(value: ENTITY): Promise<void>;
  get(): Promise<ENTITY>;
  addOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void;
  removeOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void;
}

class DefaultStorageStrategy<ENTITY> implements StorageStrategy<ENTITY> {
  constructor(
    private type: StorageType,
    private key: string,
    private defaultValueSupplier: () => ENTITY
  ) {}

  async set(value: ENTITY): Promise<void> {
    return set(this.type, this.key, value);
  }

  async get(): Promise<ENTITY> {
    return get(this.type, this.key, this.defaultValueSupplier());
  }

  addOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    addOnChangeListener(this.type, this.key, listener);
  }

  removeOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    removeOnChangeListener(this.type, listener);
  }
}

type ChunkMeta = { v: 1; parts: number; chunkSize: number; originalSize: number };

// 추후 Array, Record 등 다양한 타입에 대해 별도의 전략을 구현할 수 있도록 재설계 필요
class ChunkedArrayStorageStrategy<ENTITY> implements StorageStrategy<ENTITY> {
  private readonly chunkSize = 7500;
  private previousEntity : ENTITY | null = null;

  // Placeholder for a more complex strategy that handles large data with chunking
  constructor(
    private type: StorageType,
    private key: string,
    private defaultValueSupplier: () => ENTITY,
    private META_KEY = `__chunk__:${key}::__meta`
  ) {}

  private chunkKey(index: number): string {
    return `__chunk__:${this.key}::_part_${index}`;
  }

  private async combineChunks(): Promise<ENTITY | null> {
    const meta = await get<ChunkMeta | null>(this.type, this.META_KEY, null);
    if (!meta || !meta.parts) return null;

    const pieces: ENTITY[] = [];
    for (let i = 0; i < meta.parts; i++) {
      const piece = await get<ENTITY | null>(this.type, this.chunkKey(i), null);
      if (piece === null) {
        console.warn(`Missing chunk ${i} for key ${this.key}`);
        return null; // Missing chunk, cannot reconstruct
      }

      pieces.push(piece);
    }
    return ChunkifyUtil.combineChunks(pieces as unknown[][]) as ENTITY;
  }

  private chunkify(entity: ENTITY, maxBytes: number): ENTITY[] {
    if (typeof entity !== 'object' || Array.isArray(entity) === false) {
      throw new Error('ChunkedArrayStorageStrategy only supports array or object types.');
    }

    return ChunkifyUtil.chunkifyArray(entity as unknown[], maxBytes) as ENTITY[];
  }

  async set(value: ENTITY): Promise<void> {
    if (value === null || value === undefined) {
      throw new Error('Cannot store null or undefined value.');
    }

    const oldMeta = await get<ChunkMeta | null>(this.type, this.META_KEY, null);
    this.previousEntity = await this.get();
    if (this.previousEntity && JSON.stringify(this.previousEntity) === JSON.stringify(value)) {
      return; // No change, do not update
    }

    const parts = this.chunkify(value, this.chunkSize);
    const meta: ChunkMeta = { v: 1, parts: parts.length, chunkSize: this.chunkSize, originalSize: JSON.stringify(value).length };

    // console.log(`current storage QUOTA:`, chrome.storage.sync.QUOTA_BYTES_PER_ITEM);
    // console.log(`Storing ${JSON.stringify(value).length} chars in ${parts.length} chunks of up to ${this.chunkSize} bytes each.`, parts, meta);

    for (let i = 0; i < parts.length; i++) {
      // console.log(`Storing chunk ${i + 1}/${parts.length}, ${JSON.stringify(parts[i]).length} chars.`);
      await set(this.type, this.chunkKey(i), parts[i]);
    }
    await set(this.type, this.META_KEY, meta);

    if (oldMeta && oldMeta.parts > parts.length) {
      const toClear = [];
      for (let i = parts.length; i < oldMeta.parts; i++) {
        toClear.push(set(this.type, this.chunkKey(i), ''));
      }
      await Promise.all(toClear);
    }
  }

  async get(): Promise<ENTITY> {
    const joined = await this.combineChunks();
    if (!joined) return this.defaultValueSupplier();
    try {
      return joined;
    } catch (e) {
      console.error('Failed to parse stored data:', e);
      return this.defaultValueSupplier();
    }
  }

  private wrappedListenerMap = new WeakMap<
    (newValue: ENTITY, oldValue: ENTITY) => void,
    () => void
  >();

  addOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    const listenerWrapper = async () => {
      const newValue = await this.get();
      const oldValue = this.previousEntity || newValue;
      listener(newValue, oldValue);
    }
    addOnChangeListener(this.type, this.META_KEY, listenerWrapper);
    this.wrappedListenerMap.set(listener, listenerWrapper);
  }

  removeOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    removeOnChangeListener(this.type, this.wrappedListenerMap.get(listener)!);
    this.wrappedListenerMap.delete(listener);
  }
}

type GoogleDriveStorageHint = { fileId: string; lastModified: string, hash: string };

class GoogleDriveStorageStrategy<ENTITY> implements StorageStrategy<ENTITY> {
  private previousEntity : ENTITY | null = null;

  constructor(
    private type: StorageType,
    private key: string,
    private defaultValueSupplier: () => ENTITY
  ) {}

  private hintKey(key: string): string {
    return `__gdrive_hint__:${key}`;
  }

  async set(value: ENTITY): Promise<void> {
    if (value === null || value === undefined) {
      throw new Error('Cannot store null or undefined value.');
    }

    const content = JSON.stringify(value);
    const newHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content)).then(buf => {
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    });

    const hint = await get<GoogleDriveStorageHint | null>(this.type, this.hintKey(this.key), null);

    if (hint && hint.hash === newHash) {
      return;
    }


    let fileId = hint?.fileId;
    try {
      if (fileId) {
        const previousContent = await GoogleDriveApi.readFile(fileId);
        this.previousEntity = JSON.parse(previousContent) as ENTITY;
        await GoogleDriveApi.updateFile(fileId, content);
      } else {
        fileId = await GoogleDriveApi.createFile(`${this.key}.json`, content);
      }
      const newHint: GoogleDriveStorageHint = { fileId, lastModified: new Date().toISOString(), hash: newHash  };
      await set(this.type, this.hintKey(this.key), newHint);
    } catch (e) {
      console.error('Failed to store data to Google Drive:', e);
      throw e;
    }
  }

  async get(): Promise<ENTITY> {
    const hint = await get<GoogleDriveStorageHint | null>(this.type, this.hintKey(this.key), null);
    if (!hint || !hint.fileId) {
      return this.defaultValueSupplier();
    }

    try {
      const content = await GoogleDriveApi.readFile(hint.fileId);
      return JSON.parse(content) as ENTITY;
    } catch (e) {
      console.error('Failed to read data from Google Drive:', e);
      return this.defaultValueSupplier();
    }
  }

  private wrappedListenerMap = new WeakMap<
    (newValue: ENTITY, oldValue: ENTITY) => void,
    () => void
  >();

  addOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    const listenerWrapper = async () => {
      const newValue = await this.get();
      const oldValue = this.previousEntity || this.defaultValueSupplier();
      listener(newValue, oldValue);
    }
    addOnChangeListener(this.type, this.hintKey(this.key), listenerWrapper);
    this.wrappedListenerMap.set(listener, listenerWrapper);
  }

  removeOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    removeOnChangeListener(this.type, this.wrappedListenerMap.get(listener)!);
    this.wrappedListenerMap.delete(listener);
  }
}

export function createStorageStrategy<ENTITY>(
  type: StorageType,
  key: string,
  defaultValueSupplier: () => ENTITY,
  strategyType: StorageStrategyType
): StorageStrategy<ENTITY> {
  switch (strategyType) {
    case 'default':
      return new DefaultStorageStrategy<ENTITY>(type, key, defaultValueSupplier);
    case 'chunkedArray':
      //Type 'ENTITY' does not satisfy the constraint 'unknown[]'.
      return new ChunkedArrayStorageStrategy<ENTITY>(type, key, defaultValueSupplier);
    case 'googleDrive':
      return new GoogleDriveStorageStrategy<ENTITY>(type, key, defaultValueSupplier);
    default:
      throw new Error(`Unknown storage strategy type: ${strategyType}`);
  }
}

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
  private readonly storageStrategy: StorageStrategy<ENTITY>;

  constructor(type: StorageType, key: string, defaultValueSupplier?: () => ENTITY, strategyType: StorageStrategyType = 'default') {
    this.definition = defineStorage(type, key);
    this.storageStrategy = createStorageStrategy(type, key, defaultValueSupplier || (() => null as ENTITY), strategyType);
  }

  async set(value: ENTITY): Promise<void> {
    return this.storageStrategy.set(value);
  }

  get type(): StorageType {
    return this.definition.type;
  }

  get key(): string {
    return this.definition.key;
  }

  async get(): Promise<ENTITY> {
    return this.storageStrategy.get();
  }

  addOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    this.storageStrategy.addOnChangeListener(listener);
  }

  removeOnChangeListener(listener: (newValue: ENTITY, oldValue: ENTITY) => void): void {
    this.storageStrategy.removeOnChangeListener(listener);
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

export function resolveStorageArea(type: StorageType): chrome.storage.StorageArea {
  return StorageTypeEnum[type].module;
}