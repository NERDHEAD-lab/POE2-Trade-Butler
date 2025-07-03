import * as storage from './storage';
import { get, set, StorageType } from './storage';

const SEARCH_HISTORY_STORAGE_TYPE: StorageType = 'local';
const SEARCH_HISTORY_KEY = 'searchHistory';

export interface SearchHistoryEntity {
  id: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
}

export function addOnChangeListener(
  listener: (newValue: SearchHistoryEntity[], oldValue: SearchHistoryEntity[]) => void
): void {
  storage.addOnChangeListener(SEARCH_HISTORY_STORAGE_TYPE, SEARCH_HISTORY_KEY, listener);
}

export function addOnDeletedListener(
  listener: (deletedId: string) => void
): void {
  storage.addOnChangeListener<SearchHistoryEntity[]>(SEARCH_HISTORY_STORAGE_TYPE, SEARCH_HISTORY_KEY, (newValue, oldValue) => {
    const newIds = new Set(newValue.map(entry => entry.id));
    const oldIds = new Set(oldValue.map(entry => entry.id));

    const deletedIds = Array.from(oldIds).filter(id => !newIds.has(id));
    deletedIds.forEach(deletedId => listener(deletedId));
  });
}

export async function getAll(): Promise<SearchHistoryEntity[]> {
  return get(SEARCH_HISTORY_STORAGE_TYPE, SEARCH_HISTORY_KEY, []);
}

export async function addOrUpdate(id: string, url: string): Promise<boolean> {
  const history = await getAll();
  const index = history.findIndex(entry => entry.id === id);

  const isNewEntry = index < 0;

  if (isNewEntry) {
    history.push({
      id: id,
      url: url,
      lastSearched: new Date().toISOString(),
      previousSearches: [],
    });
  } else {
    const existing = history[index];
    existing.previousSearches.push(existing.lastSearched);
    existing.lastSearched = new Date().toISOString();
  }

  await set(SEARCH_HISTORY_STORAGE_TYPE, SEARCH_HISTORY_KEY, history);

  return isNewEntry;
}

export async function deleteById(id: string): Promise<void> {
  const history = await getAll();
  const updated = history.filter(entry => entry.id !== id);
  await set(SEARCH_HISTORY_STORAGE_TYPE, SEARCH_HISTORY_KEY, updated);
}

export async function exists(id: string): Promise<boolean> {
  const history = await getAll();
  return history.some(entry => entry.id === id);
}

export async function removeAll(): Promise<void> {
  await set(SEARCH_HISTORY_STORAGE_TYPE, SEARCH_HISTORY_KEY, []);
}