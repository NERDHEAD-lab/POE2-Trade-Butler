import * as storage from './storage';
import { get, set, StorageType } from './storage';
import { FileSystemEntry } from '../ui/fileSystemEntry';

const STORAGE_FAVORITE_TYPE: StorageType = 'sync';
const STORAGE_FAVORITE_KEY = 'favoriteFolders';

const DEFAULT_FAVORITE_MAP: () => FileSystemEntry[] = () => [{
  id: 'root',
  name: '/',
  type: 'folder',
  parentId: null,
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString()
}];

export async function getAll(): Promise<FileSystemEntry[]> {
  return get<FileSystemEntry[]>(STORAGE_FAVORITE_TYPE, STORAGE_FAVORITE_KEY, DEFAULT_FAVORITE_MAP());
}

export async function saveAll(favorites: FileSystemEntry[]): Promise<void> {
  await set(STORAGE_FAVORITE_TYPE, STORAGE_FAVORITE_KEY, favorites);
}

export async function exists(id: string): Promise<boolean> {
  const favorites = await getAll();
  return favorites
    .filter(entry => entry.type === 'folder')
    .some(entry => entry.id === id);
}

export function addOnChangeListener(
  listener: (newValue: FileSystemEntry[], oldValue: FileSystemEntry[]) => void
): void {
  storage.addOnChangeListener(STORAGE_FAVORITE_TYPE, STORAGE_FAVORITE_KEY, listener);
}

export function addOnDeletedListener(
  listener: (deletedId: string) => void
): void {
  storage.addOnChangeListener<FileSystemEntry[]>(STORAGE_FAVORITE_TYPE, STORAGE_FAVORITE_KEY, (newValue, oldValue) => {
    const newIds = new Set(newValue.map(entry => entry.id));
    const oldIds = new Set(oldValue.map(entry => entry.id));

    const deletedIds = Array.from(oldIds).filter(id => !newIds.has(id));
    deletedIds.forEach(deletedId => listener(deletedId));
  });
}