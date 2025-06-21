import { showToast } from './api';

// TODO: 종류 별로 별도 Repository 클래스로 분리 필요
/********************* MockSafety Check *********************/
const isChromeAvailable = typeof chrome !== 'undefined' && chrome.storage?.local;

const storage = isChromeAvailable
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

const STORAGE_SEARCH_HISTORY_KEY = 'searchHistory';

export interface SearchHistoryEntity {
  id: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
}

type SearchHistoryChangedListener = (newEntries: SearchHistoryEntity[]) => void;
const searchHistoryChangedListener = new Map<string, SearchHistoryChangedListener>();

export function addSearchHistoryChangedListener(key: string, fn: SearchHistoryChangedListener): void {
  searchHistoryChangedListener.set(key, fn);
}

export function removeSearchHistoryChangedListener(key: string): void {
  searchHistoryChangedListener.delete(key);
}

function notifySearchHistoryChangedListener(newEntries: SearchHistoryEntity[]) {
  searchHistoryChangedListener.forEach(fn => fn(newEntries));
}

export async function getAllHistory(): Promise<SearchHistoryEntity[]> {
  return new Promise((resolve) => {
    storage.get([STORAGE_SEARCH_HISTORY_KEY], (storage) => {
      resolve(storage[STORAGE_SEARCH_HISTORY_KEY] || []);
    });
  });
}

/**
 * Adds a new search history entry or updates an existing one.
 * @param entry
 * @returns {Promise<Boolean>} Returns true if a new entry was added, false if an existing entry was updated.
 */
export async function addOrUpdateHistory(entry: {
  id: string;
  url: string;
}): Promise<Boolean> {
  const history = await getAllHistory();
  const index = history.findIndex((item) => item.id === entry.id);

  const isNewEntry = index < 0;

  if (isNewEntry) {
    history.push({
      id: entry.id,
      url: entry.url,
      lastSearched: new Date().toISOString(),
      previousSearches: []
    });
  } else {
    const existing = history[index];
    existing.previousSearches.push(existing.lastSearched);
    existing.lastSearched = new Date().toISOString();
  }

  await storage.set({ [STORAGE_SEARCH_HISTORY_KEY]: history });
  notifySearchHistoryChangedListener(history);

  return isNewEntry;
}

export async function deleteHistoryById(id: string): Promise<void> {
  const history = await getAllHistory();
  const updated = history.filter(entry => entry.id !== id);
  await storage.set({ [STORAGE_SEARCH_HISTORY_KEY]: updated });

  notifySearchHistoryChangedListener(updated);
}

export async function isExistingHistory(id: string): Promise<boolean> {
  const history = await getAllHistory();
  return history.some(entry => entry.id === id);
}

export async function clearHistory(): Promise<void> {
  await storage.remove(STORAGE_SEARCH_HISTORY_KEY);

  notifySearchHistoryChangedListener([]);
