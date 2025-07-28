import { StorageManager } from './storage';
import * as searchHistory from './searchHistoryStorage';
import * as favorite from './favoriteStorage';

export interface PreviewPanelSnapshot {
  searchKeyword: string;
  outerHTML: string;
  attributes: { [key: string]: string };
  timestamp: number;
}

const previewStorage = new StorageManager<Record<string, PreviewPanelSnapshot>>(
  'local',
  'previewPanelSnapshots',
  () => ({}) as Record<string, PreviewPanelSnapshot>
);

export function addOnChangeListener(
  listener: (
    newValue: Record<string, PreviewPanelSnapshot>,
    oldValue: Record<string, PreviewPanelSnapshot>
  ) => void
): void {
  previewStorage.addOnChangeListener(listener);
}

async function getAll(): Promise<Record<string, PreviewPanelSnapshot>> {
  return previewStorage.get();
}

async function deleteById(id: string): Promise<void> {
  const currentSnapshots: Record<string, PreviewPanelSnapshot> = await getAll();
  delete currentSnapshots[id];
  await previewStorage.set(currentSnapshots);
}

export async function getById(id: string): Promise<PreviewPanelSnapshot> {
  return previewStorage.get().then(result => result[id] || null);
}

export async function addOrUpdateById(id: string, snapshot: PreviewPanelSnapshot): Promise<void> {
  const currentSnapshots: Record<string, PreviewPanelSnapshot> = await getAll();
  // 두 개의 hash를 비교
  if (currentSnapshots[id] && JSON.stringify(currentSnapshots[id]) === JSON.stringify(snapshot)) {
    return; // No change, do not update
  }

  // Update or add the snapshot
  currentSnapshots[id] = snapshot;
  await previewStorage.set(currentSnapshots);
}

export async function exists(id: string): Promise<boolean> {
  const currentSnapshots: Record<string, PreviewPanelSnapshot> = await getAll();
  return Object.prototype.hasOwnProperty.call(currentSnapshots, id);
}

//다른 저장소에서 id 확인 후 참조가 없는 경우에만 삭제
export async function deleteIfOrphaned(
  deletedId: string,
  triggered: 'searchHistory' | 'favorite'
): Promise<void> {
  const currentSnapshots: Record<string, PreviewPanelSnapshot> = await getAll();
  const snapshots: PreviewPanelSnapshot = currentSnapshots[deletedId] || {};

  if (Object.keys(snapshots).length === 0) return; // No snapshot found for the given ID

  let existsInOtherStorage = false;
  if (triggered === 'searchHistory') {
    //반대편을 확인
    existsInOtherStorage = await favorite.existsByMetadataId(deletedId);
  } else if (triggered === 'favorite') {
    existsInOtherStorage = await searchHistory.exists(deletedId);
  }

  if (existsInOtherStorage) return;

  await deleteById(deletedId);
}

/**
 * 24h 이상된 스냅샷을 삭제합니다. (history, favorite에 orphan된 경우)
 */
export async function cleanExpiredOrphanSnapshots(): Promise<void> {
  const now = Date.now();
  await getAll()
    .then(snapshots => {
      return Object.fromEntries(
        Object.entries(snapshots).filter(([key]) => {
          return !searchHistory.exists(key) && !favorite.existsByMetadataId(key);
        })
      );
    })
    .then(snapshots => {
      return Object.fromEntries(
        Object.entries(snapshots).filter(([, snapshot]) => {
          return now - snapshot.timestamp <= 24 * 60 * 60 * 1000;
        })
      );
    });
}
