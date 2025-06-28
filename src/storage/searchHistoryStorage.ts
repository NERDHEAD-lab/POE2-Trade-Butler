import { getSetting, setSetting, addOnChangeListener, StorageType, localStorage } from './storageLoader';

const STORAGE_SEARCH_HISTORY_KEY = 'searchHistory';

export interface SearchHistoryEntity {
  id: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
  etc?: Record<string, any>; // 기타 정보 (예: 프리뷰 데이터 등)
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
    localStorage.get([STORAGE_SEARCH_HISTORY_KEY], (storage) => {
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
  etc?: Record<string, any>;
}): Promise<Boolean> {
  const history = await getAllHistory();
  const index = history.findIndex((item) => item.id === entry.id);

  const isNewEntry = index < 0;

  if (isNewEntry) {
    history.push({
      id: entry.id,
      url: entry.url,
      lastSearched: new Date().toISOString(),
      previousSearches: [],
      etc: entry.etc || {}
    });
  } else {
    const existing = history[index];
    existing.previousSearches.push(existing.lastSearched);
    existing.lastSearched = new Date().toISOString();
  }

  await localStorage.set({ [STORAGE_SEARCH_HISTORY_KEY]: history });
  notifySearchHistoryChangedListener(history);

  return isNewEntry;
}

export async function putIfAbsentEtc(id: string, key: string, callbackValue: () => any): Promise<void> {
  const history = await getAllHistory();
  const entry = history.find(item => item.id === id);

  if (!entry) {
    throw new Error(`No search history found for id: ${id}`);
  }

  if (!entry.etc) {
    entry.etc = {};
  }

  if (!(key in entry.etc)) {
    try {
      const callbackValueResult = callbackValue();
      entry.etc[key] = (callbackValueResult instanceof Promise) ? await callbackValueResult : callbackValueResult;
      await localStorage.set({ [STORAGE_SEARCH_HISTORY_KEY]: history });

      notifySearchHistoryChangedListener(history);
    } catch (error) {
      console.error(`Error setting etc.${key} for id ${id}:`, error);
      throw new Error(`Failed to set etc.${key} for id ${id}`);
    }
  }
}



export async function getEtcValue(id: string, key: string): Promise<any> {
  const history = await getAllHistory();
  const entry = history.find(item => item.id === id);

  if (!entry || !entry.etc || !(key in entry.etc)) {
    throw new Error(`No etc.${key} found for id: ${id}`);
  }

  return entry.etc[key];
}

export async function deleteHistoryById(id: string): Promise<void> {
  const history = await getAllHistory();
  const updated = history.filter(entry => entry.id !== id);
  await localStorage.set({ [STORAGE_SEARCH_HISTORY_KEY]: updated });

  notifySearchHistoryChangedListener(updated);
}

export async function isExistingHistory(id: string): Promise<boolean> {
  const history = await getAllHistory();
  return history.some(entry => entry.id === id);
}

export async function clearAllHistory(): Promise<void> {
  await localStorage.remove(STORAGE_SEARCH_HISTORY_KEY);

  notifySearchHistoryChangedListener([]);
}