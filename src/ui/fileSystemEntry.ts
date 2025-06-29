export type FileSystemEntry = FileEntry | FolderEntry;

export interface BaseEntry {
  readonly id: string;
  name: string;
  readonly type: 'file' | 'folder';
  parentId: string | null;  // null이면 루트
  createdAt?: string;
  modifiedAt?: string;
}

export interface FileEntry extends BaseEntry {
  readonly type: 'file';
  content?: string;
  metadata?: Record<string, any>;
}

export interface FolderEntry extends BaseEntry {
  readonly type: 'folder';
}

export function isFileEntry(entry: FileSystemEntry): entry is FileEntry {
  return entry.type === 'file';
}

export function sortEntries(entries: FileSystemEntry[]): FileSystemEntry[] {
  return entries.sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'folder' ? -1 : 1; // 폴더가 파일보다 먼저 오도록
  });
}