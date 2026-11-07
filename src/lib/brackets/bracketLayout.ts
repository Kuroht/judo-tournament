/**
 * =====================================================
 * FILE: bracketLayout.ts
 * PURPOSE: Where each draw position sits on the draw sheet.
 * USED BY: resolveBracket.ts, assignDrawPositions.ts
 * =====================================================
 */

export type PoolName = 'A' | 'B' | 'C' | 'D';

const POOL_NAMES: readonly PoolName[] = ['A', 'B', 'C', 'D'];

// IJF and FPJ Article 40 seeding: 1-8 in pool A, 4-5 in B, 2-7 in C and 3-6 in D.
const SMALLEST_LAYOUT = [1, 8, 4, 5, 2, 7, 3, 6];

/**
 * Finds the size of draw sheet that fits a number of athletes.
 * @example
 * getBracketSize(11); // 16
 */
export function getBracketSize(athleteCount: number): number {
  let size = SMALLEST_LAYOUT.length;
  while (size < athleteCount) {
    size *= 2;
  }

  return size;
}

/**
 * Lists the draw positions from the top of the sheet to the bottom. Neighbours
 * meet in the first round, and their positions always add up to size + 1.
 * Positions above the number of athletes are empty, which is what gives byes.
 * @param size the size of the draw sheet
 * @example
 * getBracketLayout(16); // [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]
 */
export function getBracketLayout(size: number): number[] {
  let layout = SMALLEST_LAYOUT;

  // 1. Doubling the sheet gives each position a new opponent beside it.
  while (layout.length < size) {
    const newSize = layout.length * 2;
    layout = layout.flatMap((position) => [position, newSize + 1 - position]);
  }

  return layout;
}

/**
 * Finds which pool a place on the sheet belongs to. Each pool is a quarter of it.
 * @param index how far down the sheet, starting at 0
 * @param sheetLength how many places the sheet has at this stage
 */
export function getPoolAt(index: number, sheetLength: number): PoolName {
  const poolIndex = Math.floor(index / (sheetLength / POOL_NAMES.length));

  return POOL_NAMES[poolIndex] ?? 'A';
}
