import { localStorage } from './storage';

interface CachedData<T> {
  timestamp: number;
  data: T;
}

export async function getOrFetchCache<T>(
  key: string,
  maxAge: number,
  supplier: () => Promise<T>
): Promise<T> {
  const cached = await getCachedData<T>(key, maxAge);
  if (cached !== null) {
    return cached;
  }

  const fresh = await supplier();
  await setCachedData(key, fresh);
  return fresh;
}

async function getCachedData<T>(key: string, maxAge: number): Promise<T | null> {
  return new Promise((resolve) => {
    localStorage.get([key], (result) => {
      const cached = result[key] as CachedData<T> | undefined;
      if (cached && (Date.now() - cached.timestamp < maxAge)) {
        resolve(cached.data);
      } else {
        resolve(null);
      }
    });
  });
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
  const cachedData: CachedData<T> = {
    timestamp: Date.now(),
    data
  };
  return new Promise((resolve) => {
    localStorage.set({ [key]: cachedData }, () => {
      resolve();
    });
  });
}