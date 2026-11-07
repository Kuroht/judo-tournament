/**
 * =====================================================
 * FILE: groupTiles.test.ts
 * PURPOSE: Checks how tiles are sorted into their groups.
 * USED BY: npm test
 * =====================================================
 */
import { groupTiles } from '../TileGroups';

describe('groupTiles', () => {
  it('keeps the groups and tiles in the order they came in', () => {
    const tiles = [
      { group: 'Cadetes', id: '1' },
      { group: 'Seniores', id: '2' },
      { group: 'Cadetes', id: '3' },
    ];

    expect(groupTiles(tiles)).toEqual([
      {
        title: 'Cadetes',
        tiles: [
          { group: 'Cadetes', id: '1' },
          { group: 'Cadetes', id: '3' },
        ],
      },
      { title: 'Seniores', tiles: [{ group: 'Seniores', id: '2' }] },
    ]);
  });

  it('gives nothing for no tiles', () => {
    expect(groupTiles([])).toEqual([]);
  });
});
