/**
 * =====================================================
 * FILE: drawRules.test.ts
 * PURPOSE: Checks when a saved draw still matches the
 *          athletes who can compete.
 * USED BY: npm test
 * =====================================================
 */
import { getNextSeedNumber, isDrawCurrent, isEliminationFormat } from '../drawRules';
import type { DrawEntry } from '../types';

function entry(drawPosition: number | null, seed: number | null = null): DrawEntry {
  return {
    entryId: `entry-${drawPosition}`,
    name: 'Name',
    clubId: null,
    clubName: null,
    seed,
    drawPosition,
  };
}

describe('isDrawCurrent', () => {
  it('is current when everyone has a position, in any order', () => {
    expect(isDrawCurrent([entry(2), entry(1), entry(3)], 'SEED', 3)).toBe(true);
  });

  it('is not current without a draw', () => {
    expect(isDrawCurrent([entry(1), entry(2)], null, null)).toBe(false);
  });

  it('is not current after someone new registers', () => {
    expect(isDrawCurrent([entry(1), entry(2), entry(null)], 'SEED', 2)).toBe(false);
  });

  it('is not current after someone drops out and leaves a gap', () => {
    expect(isDrawCurrent([entry(1), entry(3)], 'SEED', 3)).toBe(false);
  });

  it('is not current after the athlete in the last position drops out', () => {
    expect(isDrawCurrent([entry(1), entry(2)], 'SEED', 3)).toBe(false);
  });

  it('is not current for a draw saved before the count existed', () => {
    expect(isDrawCurrent([entry(1), entry(2)], 'SEED', null)).toBe(false);
  });

  it('is not current with nobody left', () => {
    expect(isDrawCurrent([], 'SEED', 0)).toBe(false);
  });
});

describe('getNextSeedNumber', () => {
  it('starts at 1', () => {
    expect(getNextSeedNumber([entry(null), entry(null)])).toBe(1);
  });

  it('follows the highest seed', () => {
    expect(getNextSeedNumber([entry(null, 1), entry(null), entry(null, 2)])).toBe(3);
  });
});

describe('isEliminationFormat', () => {
  it.each(['doubleRepechage', 'quarterFinalRepechage', 'directKnockout'] as const)(
    'accepts %s',
    (format) => {
      expect(isEliminationFormat(format)).toBe(true);
    },
  );

  it.each(['poule', 'twoPoules'] as const)('refuses %s', (format) => {
    expect(isEliminationFormat(format)).toBe(false);
  });
});
