/********************* MockSafety Check *********************/
export const localStorage = chrome.storage.local;
export const syncStorage = chrome.storage.sync;
export const sessionStorage = chrome.storage.session;

export type StorageType = 'local' | 'sync' | 'session';

function getStorageModule(storage: StorageType): chrome.storage.StorageArea {
  switch (storage) {
    case 'local':
      return chrome.storage.local;
    case 'sync':
      return chrome.storage.sync;
    case 'session':
      return chrome.storage.session;
    default:
      throw new Error(`Invalid storage type: ${storage}`);
  }
}

export function setSetting<T>(storage: StorageType, key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const storageObj = getStorageModule(storage).module;
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
    const storageObj = storageType === getStorageModule(storageType);
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
  const storageObj = storage === 'local' ? localStorage : syncStorage;

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