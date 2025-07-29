export type FileSystemEntry = FileEntry | FolderEntry;
type SortType = 'name' | 'createdAt' | 'modifiedAt';

export interface BaseEntry {
  readonly id: string;
  name: string;
  readonly type: 'file' | 'folder';
  parentId: string | null; // null이면 루트
  createdAt: string;
  modifiedAt: string;
}

export interface FileEntry extends BaseEntry {
  readonly type: 'file';
  content?: string;
  metadata: Record<string, string>;
}

export interface FolderEntry extends BaseEntry {
  readonly type: 'folder';
}

export function isFileEntry(entry: FileSystemEntry): entry is FileEntry {
  return entry.type === 'file';
}

export function isFolderEntry(entry: FileSystemEntry): entry is FolderEntry {
  return entry.type === 'folder';
}

export function getPath(entries: FileSystemEntry[], entry: FileSystemEntry): string {
  if (!entry.parentId) return '/';

  const pathParts: string[] = [];
  let currentEntry: FileSystemEntry | undefined = entry;
  while (currentEntry) {
    pathParts.unshift(currentEntry.name);
    if (currentEntry.parentId === null) break; // 루트에 도달
    currentEntry = entries.find(e => e.id === currentEntry?.parentId);
  }

  return '/' + pathParts.join('/');
}

export function getDepth(entries: FileSystemEntry[], entry: FileSystemEntry): number {
  const path = getPath(entries, entry);
  if (path === '/') return 0;

  return path.split('/').length - 1;
}

export function sortEntries(
  entries: FileSystemEntry[],
  sortType: SortType = 'name',
  ascending: boolean = true
): FileSystemEntry[] {
  const sorted: FileSystemEntry[] = [];

  function sortGroup(parentId: string | null) {
    const group = entries.filter(entry => entry.parentId === parentId);

    group.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }

      let aValue = a[sortType] ?? '';
      let bValue = b[sortType] ?? '';

      if (sortType === 'createdAt' || sortType === 'modifiedAt') {
        aValue = aValue || '';
        bValue = bValue || '';
      }

      const result = String(aValue).localeCompare(String(bValue));
      return ascending ? result : -result;
    });

    for (const entry of group) {
      sorted.push(entry);
      if (entry.type === 'folder') {
        sortGroup(entry.id);
      }
    }
  }

  sortGroup(null);

  return sorted;
}

export function moveEntry(
  entries: FileSystemEntry[],
  entryId: string,
  targetParentId: string | null
): FileSystemEntry[] {
  const entry = entries.find(e => e.id === entryId);
  if (!entry) {
    throw new Error(`Entry with id ${entryId} not found`);
  }

  if (entryId === targetParentId) {
    throw new Error(`Cannot move an entry into itself`);
  }

  // 재귀적으로 후손인지 검사
  function isDescendant(parentId: string, potentialDescendantId: string): boolean {
    const children = entries.filter(e => e.parentId === parentId);
    for (const child of children) {
      if (child.id === potentialDescendantId) return true;
      if (child.type === 'folder' && isDescendant(child.id, potentialDescendantId)) return true;
    }
    return false;
  }

  if (targetParentId !== null) {
    const target = entries.find(e => e.id === targetParentId);
    if (!target || target.type !== 'folder') {
      throw new Error(`Target parent with id ${targetParentId} is not a folder`);
    }

    if (isDescendant(entryId, targetParentId)) {
      throw new Error(`Cannot move entry into its own descendant`);
    }
  }

  // entry의 parentId를 변경 + modifiedAt 업데이트 후 새 배열 반환 (불변성 유지)
  return entries.map(e =>
    e.id === entryId ? { ...e, parentId: targetParentId, modifiedAt: new Date().toISOString() } : e
  );
}

type FileEntryInput = Omit<FileEntry, 'id' | 'createdAt' | 'modifiedAt' | 'parentId'>;
type FolderEntryInput = Omit<FolderEntry, 'id' | 'createdAt' | 'modifiedAt' | 'parentId'>;
type NewEntryInput = FileEntryInput | FolderEntryInput;

function isFileEntryInput(e: NewEntryInput): e is FileEntryInput {
  return e.type === 'file';
}

function isFolderEntryInput(e: NewEntryInput): e is FolderEntryInput {
  return e.type === 'folder';
}

export function addEntry(
  entries: FileSystemEntry[],
  newEntry: NewEntryInput,
  parentId: string | null
): FileSystemEntry[] {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  let entry: FileEntry | FolderEntry;

  if (isFileEntryInput(newEntry)) {
    entry = {
      ...newEntry,
      id,
      type: 'file',
      parentId,
      createdAt: timestamp,
      modifiedAt: timestamp,
      metadata: newEntry.metadata ?? {}
    };
  } else if (isFolderEntryInput(newEntry)) {
    entry = {
      ...newEntry,
      id,
      type: 'folder',
      parentId,
      createdAt: timestamp,
      modifiedAt: timestamp
    };
  } else {
    throw new Error(`Invalid entry type: ${(newEntry as Record<string, unknown>).type}`);
  }

  // 동일 parentId를 가진 기존 항목과 이름이 중복되는지 확인
  if (entries.some(e => e.parentId === parentId && e.name === entry.name)) {
    throw new Error(`An entry with the name "${entry.name}" already exists in this folder.`);
  }

  return [...entries, entry];
}

export function getChildren(
  entries: FileSystemEntry[],
  parentId: string | null
): FileSystemEntry[] {
  return entries.filter(entry => entry.parentId === parentId);
}

export function getDescendants(
  entries: FileSystemEntry[],
  parentId: string | null
): FileSystemEntry[] {
  const result: FileSystemEntry[] = [];

  function traverse(currentParentId: string | null) {
    const children = entries.filter(entry => entry.parentId === currentParentId);
    for (const child of children) {
      result.push(child);
      if (child.type === 'folder') {
        traverse(child.id); // 재귀적으로 하위 탐색
      }
    }
  }

  traverse(parentId);
  return result;
}
