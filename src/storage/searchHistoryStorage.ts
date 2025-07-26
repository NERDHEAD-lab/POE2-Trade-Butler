import { StorageManager } from './storage';

export interface SearchHistoryEntity {
  id: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
}

const searchHistoryStorage = new StorageManager<SearchHistoryEntity[]>(
  'local',
  'searchHistory',
  () => []
);

export function addOnChangeListener(
  listener: (newValue: SearchHistoryEntity[], oldValue: SearchHistoryEntity[]) => void
): void {
  searchHistoryStorage.addOnChangeListener(listener);
}

export function addOnDeletedListener(listener: (deletedId: string) => void): void {
  searchHistoryStorage.addOnChangeListener((newValue, oldValue) => {
    const newIds = new Set(newValue.map(entry => entry.id));
    const oldIds = new Set(oldValue.map(entry => entry.id));

    const deletedIds = Array.from(oldIds).filter(id => !newIds.has(id));
    deletedIds.forEach(deletedId => listener(deletedId));
  });
}

export async function getAll(): Promise<SearchHistoryEntity[]> {
  return searchHistoryStorage.get();
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
      previousSearches: []
    });
  } else {
    const existing = history[index];
    existing.previousSearches.push(existing.lastSearched);
    existing.lastSearched = new Date().toISOString();
  }

  await searchHistoryStorage.set(history);

  return isNewEntry;
}

export async function deleteById(id: string): Promise<void> {
  const history = await getAll();
  const updated = history.filter(entry => entry.id !== id);
  await searchHistoryStorage.set(updated);
}

export async function exists(id: string): Promise<boolean> {
  const history = await getAll();
  return history.some(entry => entry.id === id);
}

export async function removeAll(): Promise<void> {
  await searchHistoryStorage.set([]);
}
