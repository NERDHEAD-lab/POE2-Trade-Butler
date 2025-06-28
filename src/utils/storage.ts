import { showToast } from './api';
import { localStorage } from '../storage/storageLoader';

// TODO: 종류 별로 별도 Repository 클래스로 분리 필요


const STORAGE_FAVORITE_KEY = 'favoriteFolders';

export interface FavoriteFolderRoot {
  name?: string;
  folders: FavoriteFolder[];
  items: FavoriteItem[];
}

const favoriteFolderRoot: FavoriteFolderRoot = {
  name: '/',
  folders: [],
  items: []
};

export interface FavoriteItem {
  id: string;       // SearchHistoryEntity.id
  name?: string;    // 사용자 지정 별칭 (기본값: id)
  url: string;      // SearchHistoryEntity.url
  etc?: Record<string, any>; // 기타 정보 (예: 프리뷰 데이터 등)
}

export interface FavoriteFolder {
  name: string;                   // 폴더 표시 이름
  folders?: FavoriteFolder[];     // 하위 폴더
  items?: FavoriteItem[];         // 포함된 즐겨찾기 항목
}

type FavoriteFolderChangedListener = (root: FavoriteFolderRoot) => void;
const favoriteFolderChangedListener = new Map<string, FavoriteFolderChangedListener>();

export function addFavoriteFolderChangedListener(key: string, fn: FavoriteFolderChangedListener): void {
  favoriteFolderChangedListener.set(key, fn);
}

export function removeFavoriteFolderChangedListener(key: string): void {
  favoriteFolderChangedListener.delete(key);
}

function notifyFavoriteFolderChangedListener(root: FavoriteFolderRoot) {
  favoriteFolderChangedListener.forEach(fn => fn(root));
}



export async function getFavoriteFolderRoot(): Promise<FavoriteFolderRoot> {
  return new Promise(resolve => {
    localStorage.get([STORAGE_FAVORITE_KEY], (result) => {
      resolve(result[STORAGE_FAVORITE_KEY] || favoriteFolderRoot);
    });
  });
}

async function saveFavoriteFolderRoot(root: FavoriteFolderRoot): Promise<void> {
  return new Promise(resolve => {
    localStorage.set({ [STORAGE_FAVORITE_KEY]: root }, () => {
      resolve();
      notifyFavoriteFolderChangedListener(root);
    });
  });
}

export async function hasAnyItemInPath(path: string): Promise<boolean> {
  const root = await getFavoriteFolderRoot();
  return hasAnyItemInPathInternal(root, path);
}

function hasAnyItemInPathInternal(root: FavoriteFolderRoot, path: string): boolean {
  const folder = findFolderByPath(root, path);
  if (!folder) return false;

  if (folder.items?.length) return true;

  if (folder.folders?.length) {
    for (const sub of folder.folders) {
      if (hasAnyItemInPathInternal(root, `${path}/${sub.name}`)) {
        return true;
      }
    }
  }

  return false;
}

function findFolderByPath(root: FavoriteFolderRoot, path: string): FavoriteFolder | FavoriteFolderRoot | null {
  let current: FavoriteFolderRoot | FavoriteFolder | null = null;
  if (path === '/' || path === '') return root;

  const parts = path.split('/').filter(Boolean);
  current = root;

  for (const part of parts) {
    if (!current.folders) return null;
    const next: FavoriteFolder | undefined = current.folders.find(f => f.name === part);
    if (!next) return null;
    current = next;
  }

  return current;
}


export async function createFavoriteFolder(parentPath: string, name: string): Promise<boolean> {
  const root = await getFavoriteFolderRoot();

  const parts = parentPath.split('/').filter(Boolean);
  let current: FavoriteFolderRoot | FavoriteFolder = root;

  for (const part of parts) {
    const next: FavoriteFolder | undefined = (current.folders || []).find(f => f.name === part);
    if (!next) return false; // 부모 경로가 존재하지 않음
    current = next;
  }

  current.folders = current.folders || [];

  if (current.folders.some(f => f.name === name)) {
    return false; // 중복
  }

  current.folders.push({ name });
  await saveFavoriteFolderRoot(root);
  return true;
}


export async function isFavoriteContains(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    localStorage.get([STORAGE_FAVORITE_KEY], (storage) => {
      const favorites: FavoriteFolderRoot = storage[STORAGE_FAVORITE_KEY] || { folders: [], items: [] };

      //root 및 folder 내 재귀한다.
      function searchInFolder(folder: FavoriteFolder, id: string): boolean {
        if (folder.items?.some(item => item.id === id)) {
          return true;
        }
        return folder.folders?.some(subFolder => searchInFolder(subFolder, id)) || false;
      }


      const existsInRoot = favorites.items.some(item => item.id === id);
      const existsInFolders = favorites.folders.some(folder => searchInFolder(folder, id));
      resolve(existsInRoot || existsInFolders);
    });
  });
}

export async function isFavoriteExists(path: string, id: string): Promise<boolean> {
  const root = await getFavoriteFolderRoot();
  const folder = findFolderByPath(root, path);
  if (!folder) return false;

  return (folder.items || []).some(item => item.id === id);
}

export async function addFavoriteItem(path: string, item: FavoriteItem): Promise<void> {
  const root = await getFavoriteFolderRoot();
  const folder = findFolderByPath(root, path);
  if (!folder) throw new Error(`Folder path not found: ${path}`);

  folder.items = folder.items || [];
  folder.items.push(item);

  await saveFavoriteFolderRoot(root);
}

export async function removeFavoriteItem(path: string): Promise<boolean> {
  const root: FavoriteFolderRoot = await getFavoriteFolderRoot();
  const segments = path.split('/').filter(Boolean); // remove empty strings
  if (segments.length < 1) return false;

  const itemId = segments.pop()!;

  let current: FavoriteFolderRoot | FavoriteFolder = root;
  for (const folderName of segments) {
    const next: FavoriteFolder | undefined = (current.folders || []).find((f: FavoriteFolder) => f.name === folderName);
    if (!next) return false;
    current = next;
  }

  const originalLength = current.items?.length || 0;
  current.items = (current.items || []).filter(item => item.id !== itemId);
  const changed = current.items.length !== originalLength;

  if (changed) {
    await saveFavoriteFolderRoot(root);
  }

  return changed;
}

export async function deleteFavoriteFolder(path: string): Promise<boolean> {
  const root = await getFavoriteFolderRoot();
  const parts = path.split('/').filter(Boolean);
  let current: FavoriteFolderRoot | FavoriteFolder = root;
  let parent: FavoriteFolderRoot | FavoriteFolder | null = null;
  let folderToDelete: FavoriteFolder | null = null;

  for (const part of parts) {
    if (!current.folders) return false; // 경로가 잘못됨
    parent = current;
    folderToDelete = current.folders.find(f => f.name === part) || null;
    if (!folderToDelete) return false; // 폴더가 존재하지 않음
    current = folderToDelete;
  }

  if (parent && folderToDelete && parent.folders) {
    parent.folders = parent.folders.filter(f => f !== folderToDelete);
    await saveFavoriteFolderRoot(root);
    return true;
  }

  return false;
}

export async function renameFavoriteElement(
  type: 'folder' | 'item',
  path: string,
  newName: string
): Promise<boolean> {
  if (newName === '' || newName.includes('/')) {
    console.error('Invalid name for renaming:', newName);
    return false; // 이름이 비어있거나 슬래시 포함 시 실패
  }

  const root = await getFavoriteFolderRoot();

  if (type === 'folder') {
    const folder = findFolderByPath(root, path);
    if (!folder || !folder.name) return false;

    // 동일 경로 상위 폴더 내에서 이름 중복 검사
    const parent = findFolderByPath(root, path.substring(0, path.lastIndexOf('/')));
    const siblingFolders = parent?.folders ?? root.folders;

    if (siblingFolders.some(f => f.name === newName)) return false;

    folder.name = newName;
  } else if (type === 'item') {
    const segments = path.split('/');
    const id = segments[segments.length - 1];
    const parentPath = segments.slice(0, -1).join('/');
    const parentFolder = findFolderByPath(root, parentPath);

    const targetList = parentFolder?.items ?? root.items;
    const targetItem = targetList.find(item => item.id === id);
    if (!targetItem) return false;

    // 동일 폴더 내에서 이름 중복 검사
    if (targetList.some(item => item.name === newName)) return false;

    targetItem.name = newName;
  } else {
    return false;
  }

  await saveFavoriteFolderRoot(root);
  return true;
}


export async function flushFavoriteFolder(): Promise<void> {
  await localStorage.remove(STORAGE_FAVORITE_KEY);
  notifyFavoriteFolderChangedListener(favoriteFolderRoot);
  showToast('즐겨찾기 폴더가 초기화되었습니다.', '#0f0');
}