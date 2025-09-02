import { FileSystemEntry } from '../ui/fileSystemEntry';

/**
 * Defines the set of possible POE2 trade page regions based on server hostnames.
 */
export type TradeRegion =
  | 'kr'
  | 'jp'
  | 'br'
  | 'ru'
  | 'th'
  | 'de'
  | 'fr'
  | 'es'
  | 'global';

/**
 * A simplified entry that can be either a folder for an organization or a favorite item.
 */
export type SimplifiedEntry = FavoriteItem | SimplifiedFolder;

/**
 * Represents a favorite search item.
 * This contains the core data for a saved trade query.
 */
export interface FavoriteItem {
  /**
   * The type of the entity. Always 'item' for favorite items.
   * @example "item"
   */
  type: 'item';

  /**
   * The name of the favorite, typically representing the saved search query.
   * @example "Headhunter Heavy Belt"
   */
  name: string;

  /**
   * The unique key for the trade search result.
   * This value is the key returned by the POE2 trade page API for a specific search query.
   * @minLength 9
   * @maxLength 9
   * @example "9v7P3qmCK"
   */
  id: string;

  /**
   * The region code for the POE2 trade page. Must be one of the defined TradeRegion values.
   */
  region: TradeRegion;
}

/**
 * Represents a folder used to organize favorite items.
 * It can contain other favorite items or subfolders.
 */
export interface SimplifiedFolder {
  /**
   * The type of the entity. Always 'folder' for folders.
   * @example "folder"
   */
  type: 'folder';

  /**
   * The name of the folder.
   * @example "My Searches"
   */
  name: string;

  /**
   * An array of child entries (favorite items or subfolders) contained within this folder.
   */
  children: SimplifiedEntry[];
}


/**
 * Converts a flat array of `FileSystemEntry` objects into a hierarchical `SimplifiedFolder` structure.
 * It adapts the recursive logic from `getDescendants` to build a `children` array for each level.
 * @param entries A flat array containing the entire list of files and folders.
 * @param startFolderId The ID of the folder that will be the root of the tree.
 * @returns The converted `SimplifiedFolder` object, or `null` if a folder with the given ID is not found.
 */
export function buildSimplifiedTree(
  entries: FileSystemEntry[],
  startFolderId: string
): SimplifiedFolder | null {
  const rootFolderEntry = entries.find(
    (entry) => entry.id === startFolderId && entry.type === 'folder'
  );

  if (!rootFolderEntry) {
    return null;
  }

  function buildChildrenFor(currentParentId: string): SimplifiedEntry[] {
    const children: SimplifiedEntry[] = [];

    const directChildren = entries.filter(entry => entry.parentId === currentParentId);

    for (const child of directChildren) {
      if (child.type === 'folder') {
        children.push({
          type: 'folder',
          name: child.name,
          children: buildChildrenFor(child.id),
        });
      } else {
        const region = getServerRegion(new URL(child.metadata.url)) as TradeRegion;

        children.push({
          type: 'item',
          name: child.name,
          id: child.metadata.id,
          region,
        });
      }
    }
    return children;
  }

  return {
    type: 'folder',
    name: rootFolderEntry.name,
    children: buildChildrenFor(rootFolderEntry.id),
  };
}


function getServerRegion(url: URL): string {
  const hostname = url.hostname;

  if (hostname === 'poe.game.daum.net') return 'kr';
  if (hostname === 'jp.pathofexile.com') return 'jp';
  if (hostname === 'br.pathofexile.com') return 'br';
  if (hostname === 'ru.pathofexile.com') return 'ru';
  if (hostname === 'th.pathofexile.com') return 'th';
  if (hostname === 'de.pathofexile.com') return 'de';
  if (hostname === 'fr.pathofexile.com') return 'fr';
  if (hostname === 'es.pathofexile.com') return 'es';
  if (hostname === 'www.pathofexile.com') return 'global';
  return 'global'; // Default for www.pathofexile.com
}
