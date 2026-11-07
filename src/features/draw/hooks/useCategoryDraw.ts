/**
 * =====================================================
 * FILE: useCategoryDraw.ts
 * PURPOSE: Loads one category's draw, and runs, corrects,
 *          locks and unlocks it.
 * USED BY: CategoryDrawScreen.tsx
 * =====================================================
 */
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

import type { CategoryFormat } from '@/features/categories';
import { useReloadableFocusQuery } from '@/hooks/useReloadableFocusQuery';
import { assignDrawPositions } from '@/lib/brackets/assignDrawPositions';
import { assignPoulePositions } from '@/lib/brackets/assignPoulePositions';
import { createDrawSeed } from '@/lib/brackets/seededRandom';

import {
  clearDraw,
  getCategoryDraw,
  saveDraw,
  setCategoryFormat,
  setDrawLocked,
  setEntrySeed,
  swapDrawPositions,
} from '../db/drawQueries';
import { getNextSeedNumber, isEliminationFormat } from '../drawRules';
import type { DrawEntry } from '../types';

/**
 * Gives a screen one category's draw and the actions on it.
 * @param categoryId the category to show
 */
export function useCategoryDraw(categoryId: string) {
  const db = useSQLiteContext();
  const [hasActionFailed, setHasActionFailed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // A ref changes at once, so a fast second tap can't start a second action.
  const isActionRunning = useRef(false);

  const query = useCallback(
    (database: SQLiteDatabase) => getCategoryDraw(database, categoryId),
    [categoryId],
  );
  const { state, reload } = useReloadableFocusQuery(query);

  async function run(action: () => Promise<void>) {
    if (isActionRunning.current) {
      return;
    }

    isActionRunning.current = true;
    setHasActionFailed(false);
    setIsBusy(true);
    try {
      await action();
    } catch {
      setHasActionFailed(true);
    } finally {
      reload();
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  /** Gives an athlete the next seed number, or takes their seed away. */
  function toggleSeed(entry: DrawEntry, entries: readonly DrawEntry[]) {
    const seed = entry.seed === null ? getNextSeedNumber(entries) : null;

    return run(() => setEntrySeed(db, entry.entryId, seed));
  }

  /**
   * Runs the draw.
   * @param typedSeed a seed to repeat an earlier draw. Empty text creates a new seed.
   */
  function runDraw(entries: readonly DrawEntry[], format: CategoryFormat, typedSeed: string) {
    // Codes are always capitals, so typing one in lower case still repeats the draw.
    const cleanedSeed = typedSeed.trim().toUpperCase();
    const seed = cleanedSeed === '' ? createDrawSeed() : cleanedSeed;

    const positions = isEliminationFormat(format)
      ? assignDrawPositions(entries, seed)
      : assignPoulePositions(entries, seed, format === 'twoPoules' ? 2 : 1);

    return run(() => saveDraw(db, categoryId, seed, positions));
  }

  return {
    state,
    hasActionFailed,
    isBusy,
    toggleSeed,
    runDraw,
    clear: () => run(() => clearDraw(db, categoryId)),
    swap: (first: DrawEntry, second: DrawEntry) => run(() => swapDrawPositions(db, first, second)),
    setLocked: (isLocked: boolean) => run(() => setDrawLocked(db, categoryId, isLocked)),
    setFormat: (format: CategoryFormat) => run(() => setCategoryFormat(db, categoryId, format)),
  };
}
