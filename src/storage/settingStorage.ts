import { syncStorage } from './storageLoader';
import { localStorage } from './storageLoader';

const KEY_PREFIX = 'poe2trade_settings_';

function setSetting(storage: 'local' | 'sync', key: string, value: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const storageObj = storage === 'local' ? localStorage : syncStorage;
    storageObj.set({ [KEY_PREFIX + key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

function getSetting(storage: 'local' | 'sync', key: string, defaultValue: any = false): Promise<typeof defaultValue> {
  return new Promise((resolve, reject) => {
    const storageObj = storage === 'local' ? localStorage : syncStorage;
    storageObj.get(KEY_PREFIX + key, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[KEY_PREFIX + key] !== undefined ? result[KEY_PREFIX + key] : defaultValue);
      }
    });
  });
}
