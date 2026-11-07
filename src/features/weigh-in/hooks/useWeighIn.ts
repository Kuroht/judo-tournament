/**
 * =====================================================
 * FILE: useWeighIn.ts
 * PURPOSE: Loads a tournament's weigh-in, and saves each
 *          result as soon as it happens.
 * USED BY: WeighInScreen.tsx
 * =====================================================
 */
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

import { isCategoryDrawLocked } from '@/features/categories';
import { useReloadableFocusQuery } from '@/hooks/useReloadableFocusQuery';
import type { TranslationKey } from '@/lib/i18n/pt';

import {
  clearWeighIn,
  createFreeGroupAndMove,
  getWeighInData,
  markNoShow,
  moveEntry,
  saveWeight,
} from '../db/weighInQueries';
import type { EntryStatus, WeighInCategory, WeighInEntry, WeightResult } from '../types';
import { evaluateWeight } from '../weightRules';

/** Turns a weight's result into the status to save. */
function statusFor(result: WeightResult): EntryStatus {
  return result === 'pass' ? 'passed' : 'failed';
}

/**
 * Gives a screen the weigh-in data and its actions.
 * @param tournamentId the tournament to show
 */
export function useWeighIn(tournamentId: string) {
  const db = useSQLiteContext();
  const [errorKey, setErrorKey] = useState<TranslationKey | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  // A ref changes at once, so a fast second tap can't start a second action.
  const isActionRunning = useRef(false);

  const query = useCallback(
    (database: SQLiteDatabase) => getWeighInData(database, tournamentId),
    [tournamentId],
  );
  const { state, reload } = useReloadableFocusQuery(query);

  /**
   * Runs one action, unless a locked draw would be affected.
   * @param categoryIds the categories this action changes
   * @returns true if it finished without an error
   */
  async function run(categoryIds: string[], action: () => Promise<void>): Promise<boolean> {
    if (isActionRunning.current) {
      return false;
    }

    isActionRunning.current = true;
    setErrorKey(null);
    setIsBusy(true);
    try {
      for (const categoryId of categoryIds) {
        if (await isCategoryDrawLocked(db, categoryId)) {
          setErrorKey('draw.lockedMessage');
          return false;
        }
      }

      await action();
      return true;
    } catch {
      setErrorKey('common.saveError');
      return false;
    } finally {
      reload();
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  /** Saves a weight. @returns the result, or null if it couldn't be saved */
  async function recordWeight(entry: WeighInEntry, kg: number): Promise<WeightResult | null> {
    const result = evaluateWeight(kg, entry);
    const wasSaved = await run([entry.categoryId], () =>
      saveWeight(db, entry.entryId, kg, statusFor(result)),
    );

    return wasSaved ? result : null;
  }

  function setNoShow(entry: WeighInEntry) {
    return run([entry.categoryId], () => markNoShow(db, entry.entryId));
  }

  function clear(entry: WeighInEntry) {
    return run([entry.categoryId], () => clearWeighIn(db, entry.entryId));
  }

  function moveTo(entry: WeighInEntry, target: WeighInCategory) {
    return run([entry.categoryId, target.id], async () => {
      // An athlete with no weight yet simply stays "still to be weighed".
      const status =
        entry.weighedKg === null ? 'registered' : statusFor(evaluateWeight(entry.weighedKg, target));

      if (!(await moveEntry(db, entry, target.id, status))) {
        setErrorKey('weighIn.alreadyInCategory');
      }
    });
  }

  function createGroup(entry: WeighInEntry, label: string) {
    return run([entry.categoryId], async () => {
      if (!(await createFreeGroupAndMove(db, tournamentId, entry, label))) {
        setErrorKey('weighIn.groupNameTaken');
      }
    });
  }

  function clearError() {
    setErrorKey(null);
  }

  return {
    state,
    errorKey,
    clearError,
    isBusy,
    recordWeight,
    setNoShow,
    clear,
    moveTo,
    createGroup,
  };
}
