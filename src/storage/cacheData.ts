import { StorageManager } from './storage';

interface CachedData<T> {
  timestamp: number;
  data: T;
}
// key: {timestamp: number, data: T}

const cacheStorage = new StorageManager<Record<string, CachedData<unknown>>>(
  'local',
  'caches',
  () => ({}) as Record<string, CachedData<unknown>>
);

export async function getOrFetchCache<T>(
  key: string,
  maxAge: number,
  supplier: () => Promise<T>,
  forced: boolean = false
): Promise<T> {
  if (!forced) {
    const cached = await getCachedData<T>(key, maxAge);
    if (cached !== null) return cached;
  }
  const fresh = await supplier();
  await setCachedData(key, fresh);
  return fresh;
}

async function getCachedData<T>(key: string, maxAge: number): Promise<T | null> {
  return new Promise(resolve => {
    cacheStorage.get().then(result => {
      const cached = result[key] as CachedData<T>;
      if (cached && Date.now() - cached.timestamp < maxAge) {
        resolve(cached.data);
      } else {
        resolve(null);
      }
    });
  });
}

async function setCachedData<T>(key: string, data: T): Promise<void> {
  const cachedData: CachedData<T> = {
    data,
    timestamp: Date.now()
  };
  return new Promise(resolve => {
    cacheStorage.get().then(result => {
      result[key] = cachedData;
      cacheStorage.set(result).then(() => {
        resolve();
      });
    });
  });
}
