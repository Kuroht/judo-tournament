/**
 * =====================================================
 * FILE: useCategoryRegistration.ts
 * PURPOSE: Loads one category's athletes, and adds or
 *          removes registrations.
 * USED BY: CategoryRegistrationScreen.tsx,
 *          AddAthletesScreen.tsx
 * =====================================================
 */
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

import { useReloadableFocusQuery } from '@/hooks/useReloadableFocusQuery';

import { addEntry, getCategoryRegistration, removeEntry } from '../db/registrationQueries';

/**
 * Gives a screen one category's registrations and the actions on them.
 * @param categoryId the category to show
 */
export function useCategoryRegistration(categoryId: string) {
  const db = useSQLiteContext();
  const [hasActionFailed, setHasActionFailed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // A ref changes at once, so a fast second tap can't start a second action.
  const isActionRunning = useRef(false);

  const query = useCallback(
    (database: SQLiteDatabase) => getCategoryRegistration(database, categoryId),
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
      // Also after a failure, because the screen's data may be why it failed.
      reload();
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  function add(athleteId: string) {
    return run(() => addEntry(db, categoryId, athleteId));
  }

  function remove(entryId: string) {
    return run(() => removeEntry(db, entryId));
  }

  return { state, hasActionFailed, isBusy, add, remove };
}
