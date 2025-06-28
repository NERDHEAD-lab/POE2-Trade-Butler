export const localStorage = chrome.storage.local;
export const syncStorage = chrome.storage.sync;
export const sessionStorage = chrome.storage.session;

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


export function set<T>(storage: StorageType, key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const storageObj = StorageTypeEnum[storage].module;
    storageObj.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export function get<T>(
  storageType: StorageType,
  key: string,
  defaultValue: T
): Promise<T> {
  return new Promise((resolve, reject) => {
    const storageObj = StorageTypeEnum[storageType].module;
    storageObj.get(key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      }
    });
  });
}

export function addOnChangeListener<T>(
  storage: StorageType,
  key: string,
  listener: (newValue: T, oldValue: T) => void
): () => void {
  const storageObj = StorageTypeEnum[storage].module;

  const changeListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    const change = changes[key];
    if (change) {
      listener(change.newValue as T, change.oldValue as T);
    }
  };

  storageObj.onChanged.addListener(changeListener);

  return () => {
    storageObj.onChanged.removeListener(changeListener);
  };
}
