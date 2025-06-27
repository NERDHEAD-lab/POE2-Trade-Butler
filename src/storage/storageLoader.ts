import { showToast } from '../utils/api';

/********************* MockSafety Check *********************/
const isChromeAvailable = typeof chrome !== 'undefined' && chrome.storage?.local;

export const storage = isChromeAvailable
  ? chrome.storage.local
  : {
    get: (keys: string[] | string, callback: (result: any) => void) => {
      console.warn('⚠️ Mock storage.get called', keys);
      const result: Record<string, any> = {};

      if (Array.isArray(keys)) {
        keys.forEach(key => {
          const raw = localStorage.getItem(key);
          result[key] = raw ? JSON.parse(raw) : undefined;
        });
      } else {
        const raw = localStorage.getItem(keys);
        result[keys] = raw ? JSON.parse(raw) : undefined;
      }

      callback(result);
    },

    set: (items: Record<string, any>, callback?: () => void) => {
      console.warn('⚠️ Mock storage.set called', items);
      Object.entries(items).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      callback?.();
    },

    remove: (keys: string | string[], callback?: () => void) => {
      console.warn('⚠️ Mock storage.remove called', keys);
      if (Array.isArray(keys)) {
        keys.forEach(key => localStorage.removeItem(key));
      } else {
        localStorage.removeItem(keys);
      }
      callback?.();
    },

    clear: (callback?: () => void) => {
      console.warn('⚠️ Mock storage.clear called');
      localStorage.clear();
      callback?.();
    }
  };

if (!isChromeAvailable) {
  showToast('Chrome storage API not available, using mock storage');
}