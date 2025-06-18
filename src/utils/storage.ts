import { showToast } from './api';

const isChromeAvailable = typeof chrome !== 'undefined' && chrome.storage?.local;
const storage = isChromeAvailable
  ? chrome.storage.local
  : {
    get: (keys: string[] | string, callback: (result: any) => void) => {
      console.warn('⚠️ Mock storage.get called');
      callback({});
    },
    set: (items: object, callback?: () => void) => {
      console.warn('⚠️ Mock storage.set called', items);
      callback?.();
    },
    remove: (keys: string | string[], callback?: () => void) => {
      console.warn('⚠️ Mock storage.remove called', keys);
      callback?.();
    },
    clear: (callback?: () => void) => {
      console.warn('⚠️ Mock storage.clear called');
      callback?.();
    }
  };
if (!isChromeAvailable) {
  showToast('Chrome storage API not available, using mock storage', 5000);
}

const STORAGE_KEY = 'searchHistory';

export interface SearchHistoryEntity {
  id: string;
  name: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
  favorite: boolean;
}

type SearchHistoryChangedListener = (newEntries: SearchHistoryEntity[]) => void;

const searchHistoryChangedListener: SearchHistoryChangedListener[] = [];

export function addSearchHistoryChangedListener(fn: SearchHistoryChangedListener) {
  searchHistoryChangedListener.push(fn);
}

function notifySearchHistoryChangedListener(newEntries: SearchHistoryEntity[]) {
  searchHistoryChangedListener.forEach(fn => fn(newEntries));
}

export async function getAllHistory(): Promise<SearchHistoryEntity[]> {
  return new Promise((resolve) => {
    storage.get([STORAGE_KEY], (storage) => {
      resolve(storage[STORAGE_KEY] || []);
    });
  });
}

export async function addOrUpdateHistory(entry: Partial<SearchHistoryEntity> & {
  id: string;
  url: string;
  lastSearched: string
}): Promise<void> {
  const history = await getAllHistory();
  const index = history.findIndex((item) => item.id === entry.id);

  if (index >= 0) {
    const existing = history[index];
    existing.lastSearched = entry.lastSearched;
    existing.previousSearches.push(entry.lastSearched);
    existing.favorite = entry.favorite ?? existing.favorite;
    existing.name = entry.name || existing.name;
  } else {
    history.push({
      id: entry.id,
      name: entry.name || entry.id,
      url: entry.url,
      lastSearched: entry.lastSearched,
      previousSearches: [entry.lastSearched],
      favorite: entry.favorite ?? false
    });
  }

  await new Promise<void>((resolve) => {
    storage.set({ [STORAGE_KEY]: history }, () => resolve());

    notifySearchHistoryChangedListener(history);
  });
}

export async function deleteHistoryById(id: string): Promise<void> {
  const history = await getAllHistory();
  const updated = history.filter(entry => entry.id !== id);
  await storage.set({ [STORAGE_KEY]: updated });

  notifySearchHistoryChangedListener(updated);
}

export async function clearHistory(): Promise<void> {
  await storage.remove(STORAGE_KEY);
  notifySearchHistoryChangedListener([]);
}