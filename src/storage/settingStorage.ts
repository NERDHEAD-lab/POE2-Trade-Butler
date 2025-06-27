import { localStorage } from './storageLoader';

const KEY_PREFIX = 'poe2trade_settings_';

function setSetting(key: string, value: boolean, defaultValue: boolean = false) : Promise<void> {
  return new Promise((resolve, reject) => {
    localStorage.get(KEY_PREFIX, (result) => {
      const settings: Record<string, boolean> = result[KEY_PREFIX] || {};
      settings[key] = value !== undefined ? value : defaultValue;
      localStorage.set({ [KEY_PREFIX]: settings }, () => {
        resolve();
      });
    });
  });
}

function getSetting(key: string, defaultValue: boolean = false): Promise<boolean> {
  return new Promise((resolve, reject) => {
    localStorage.get(KEY_PREFIX, (result) => {
      const settings: Record<string, boolean> = result[KEY_PREFIX] || {};
      resolve(settings[key] !== undefined ? settings[key] : defaultValue);
    });
  });
}