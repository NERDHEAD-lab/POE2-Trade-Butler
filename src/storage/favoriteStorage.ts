import { StorageManager } from './storage';
import { FileSystemEntry, FolderEntry } from '../ui/fileSystemEntry';

const DEFAULT_FAVORITE_ROOT: () => FolderEntry = () => {
  return {
    id: 'root',
    type: 'folder',
    name: '/',
    parentId: null,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
};

const favoriteStorage = new StorageManager<FileSystemEntry[]>('sync', 'favoriteFolders', () => [
  DEFAULT_FAVORITE_ROOT()
]);

export async function getAll(): Promise<FileSystemEntry[]> {
  return favoriteStorage.get();
}

export async function saveAll(favorites: FileSystemEntry[]): Promise<void> {
  if (!Array.isArray(favorites)) {
    throw new Error('Favorites must be an array of FileSystemEntry objects');
  }
  favorites.forEach(entry => {
    if (!entry.id || !entry.name || !entry.type || !entry.createdAt || !entry.modifiedAt) {
      throw new Error('Each favorite must be a valid FileSystemEntry object');
    }
  });

  // Ensure the root entry is always present
  if (!favorites.some(entry => entry.id === 'root')) {
    favorites.unshift(DEFAULT_FAVORITE_ROOT());
  }

  await favoriteStorage.set(favorites);
}

export async function existsByMetadataId(id: string, favoriteStoragePromise= getAll()): Promise<boolean> {
  return favoriteStoragePromise
    .then(favorites => favorites.filter(entry => entry.type === 'file'))
    .then(favorites => favorites.some(entry => entry.metadata.id === id));
}

export function addOnChangeListener(
  listener: (newValue: FileSystemEntry[], oldValue: FileSystemEntry[]) => void
): void {
  favoriteStorage.addOnChangeListener(listener);
}

export function removeOnChangeListener(
  listener: (newValue: FileSystemEntry[], oldValue: FileSystemEntry[]) => void
): void {
  favoriteStorage.removeOnChangeListener(listener);
}

export function addOnDeletedListener(listener: (deletedId: string) => void): void {
  favoriteStorage.addOnChangeListener((newValue, oldValue) => {
    const newIds = new Set(newValue.map(entry => entry.id));
    const oldIds = new Set(oldValue.map(entry => entry.id));

    const deletedIds = Array.from(oldIds).filter(id => !newIds.has(id));
    deletedIds.forEach(deletedId => listener(deletedId));
  });
}
