import type { FileSystemEntry } from '../ui/fileSystemEntry';
import { buildSimplifiedTree } from './shareFavorites';

describe('buildSimplifiedTree trade regions', () => {
  test('maps Kakao Games favorite URLs to kr region', () => {
    const entries: FileSystemEntry[] = [
      {
        createdAt: '2026-06-22T00:00:00.000Z',
        id: 'root',
        modifiedAt: '2026-06-22T00:00:00.000Z',
        name: '/',
        parentId: null,
        type: 'folder'
      },
      {
        createdAt: '2026-06-22T00:00:00.000Z',
        id: 'kakao-search',
        metadata: {
          id: 'abc123',
          url: 'https://poe.kakaogames.com/trade2/search/poe2/Runes%20of%20Aldur/abc123'
        },
        modifiedAt: '2026-06-22T00:00:00.000Z',
        name: 'Runes of Aldur',
        parentId: 'root',
        type: 'file'
      }
    ];

    expect(buildSimplifiedTree(entries, 'root')).toEqual({
      type: 'folder',
      name: '/',
      children: [
        {
          type: 'item',
          name: 'Runes of Aldur',
          id: 'abc123',
          region: 'kr'
        }
      ]
    });
  });
});
