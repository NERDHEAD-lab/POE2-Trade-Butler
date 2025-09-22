import { StorageManager } from './storage';
import { FileSystemEntry, FolderEntry } from '../ui/fileSystemEntry';
import * as settingStorage from './settingStorage';

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

const favoriteStorageSync = new StorageManager<FileSystemEntry[]>(
  'sync',
  'favoriteFolders',
  () => [DEFAULT_FAVORITE_ROOT()],
  'chunkedArray'
);

const favoriteStorageGoogleDrive = new StorageManager<FileSystemEntry[]>(
  'sync',
  'favoriteFolders_v2',
  () => [DEFAULT_FAVORITE_ROOT()],
  'googleDrive'
);

async function _favoriteStorage(): Promise<StorageManager<FileSystemEntry[]>> {
  const googleDriveEnabled = await settingStorage.isFavoriteGDriveSyncEnabled();
  return googleDriveEnabled ? favoriteStorageGoogleDrive : favoriteStorageSync;
}




export async function migrateStorageToGoogleDrive() {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const googleDriveEnabled = await settingStorage.isFavoriteGDriveSyncEnabled();
      if (googleDriveEnabled) {
        resolve();
        return;
      }

      const currentFavorites = await favoriteStorageSync.get();
      await favoriteStorageGoogleDrive.set(currentFavorites);
      await settingStorage.setFavoriteGDriveSyncEnabled(true);
      resolve();
    } catch (error) {
      await settingStorage.setFavoriteGDriveSyncEnabled(false);
      reject(error);
    }
  });
}

export async function getAll(): Promise<FileSystemEntry[]> {
  const favoriteStorage = await _favoriteStorage();

  return favoriteStorage.get();
}

export async function saveAll(favorites: FileSystemEntry[]): Promise<void> {
  const favoriteStorage = await _favoriteStorage();

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

export async function addOnChangeListener(
  listener: (newValue: FileSystemEntry[], oldValue: FileSystemEntry[]) => void
): Promise<void> {
  const favoriteStorage = await _favoriteStorage();

  favoriteStorage.addOnChangeListener(listener);
}

export async function removeOnChangeListener(
  listener: (newValue: FileSystemEntry[], oldValue: FileSystemEntry[]) => void
): Promise<void> {
  const favoriteStorage = await _favoriteStorage();

  favoriteStorage.removeOnChangeListener(listener);
}

export async function addOnDeletedListener(listener: (deletedId: string) => void): Promise<void> {
  const favoriteStorage = await _favoriteStorage();

  favoriteStorage.addOnChangeListener((newValue, oldValue) => {
    const newIds = new Set((newValue || []).map(entry => entry.id));
    const oldIds = new Set((oldValue || []).map(entry => entry.id));

    const deletedIds = Array.from(oldIds).filter(id => !newIds.has(id));
    if (deletedIds.length > 0) {
      deletedIds.forEach(deletedId => listener(deletedId));
    }
  });
}
