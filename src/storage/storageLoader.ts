export const localStorage = chrome.storage.local;
export const syncStorage = chrome.storage.sync;
export const sessionStorage = chrome.storage.session;

const StorageTypeEnum = {
  local: {
    module: chrome.storage.local,
    description: 'Local storage',
  },
  sync: {
    module: chrome.storage.sync,
    description: 'Sync storage',
  },
  session: {
    module: chrome.storage.session,
    description: 'Session-only storage',
  },
} as const;

export type StorageType = keyof typeof StorageTypeEnum;


export function setSetting<T>(storage: StorageType, key: string, value: T): Promise<void> {
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

export function getSetting<T>(
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

export function addOnChangeListener(
  storage: StorageType,
  key: string,
  listener: (newValue: any, oldValue: any) => void
): () => void {
  const storageObj = StorageTypeEnum[storage].module;

  const changeListener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
    if (changes[key]) {
      listener(changes[key].newValue, changes[key].oldValue);
    }
  };

  storageObj.onChanged.addListener(changeListener);

  return () => {
    storageObj.onChanged.removeListener(changeListener);
  };
}