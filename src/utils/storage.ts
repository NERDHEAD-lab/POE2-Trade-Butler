
const STORAGE_KEY = "searchHistory";

export interface SearchHistoryEntity {
  id: string;
  name: string;
  url: string;
  lastSearched: string;
  previousSearches: string[];
  favorite: boolean;
}

export async function findHistoryById(id: string): Promise<SearchHistoryEntity | undefined> {
  const history = await getAllHistory();
  return history.find((item) => item.id === id);
}

export async function getAllHistory(): Promise<SearchHistoryEntity[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (storage) => {
      resolve(storage[STORAGE_KEY] || []);
    });
  });
}

export async function addOrUpdateHistory(entry: Partial<SearchHistoryEntity> & { id: string; url: string; lastSearched: string }): Promise<void> {
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
    chrome.storage.local.set({ [STORAGE_KEY]: history }, () => resolve());
  });
}

export async function deleteHistoryById(id: string): Promise<void> {
  const history = await getAllHistory();
  const updated = history.filter(entry => entry.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}