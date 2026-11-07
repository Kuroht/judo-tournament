/**
 * =====================================================
 * FILE: drawRules.ts
 * PURPOSE: Small rules about the state of a draw. Pure
 *          functions, so they're easy to test.
 * USED BY: CategoryDrawContent.tsx, useCategoryDraw.ts
 * =====================================================
 */
import type { CategoryFormat } from '@/features/categories';
import type { EliminationFormat } from '@/lib/brackets/resolveBracket';

import type { DrawEntry } from './types';

/** Checks if a format uses an elimination bracket, rather than poules. */
export function isEliminationFormat(format: CategoryFormat): format is EliminationFormat {
  return format !== 'poule' && format !== 'twoPoules';
}

/**
 * Checks that a saved draw still matches the athletes. It stops matching if someone
 * registers, withdraws or fails the weigh-in after the draw.
 * @param entries the athletes who can compete
 * @param seed the saved draw's seed, or null if not drawn
 * @param drawnEntryCount how many athletes the draw was made for
 * @returns true only if the number is the same and everyone has a position, from
 *          1 upward with no gaps
 */
export function isDrawCurrent(
  entries: readonly DrawEntry[],
  seed: string | null,
  drawnEntryCount: number | null,
): boolean {
  if (seed === null || entries.length === 0 || drawnEntryCount !== entries.length) {
    return false;
  }

  const positions = entries.map((entry) => entry.drawPosition ?? 0).sort((a, b) => a - b);

  return positions.every((position, index) => position === index + 1);
}

/**
 * Finds the next free seed number.
 * @example
 * getNextSeedNumber([{ seed: 1 }, { seed: null }, { seed: 2 }]); // 3
 */
export function getNextSeedNumber(entries: readonly Pick<DrawEntry, 'seed'>[]): number {
  return Math.max(0, ...entries.map((entry) => entry.seed ?? 0)) + 1;
}
