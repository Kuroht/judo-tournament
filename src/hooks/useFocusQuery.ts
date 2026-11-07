/**
 * =====================================================
 * FILE: useFocusQuery.ts
 * PURPOSE: Reads data from the database each time a screen
 *          comes into view.
 * USED BY: useClubs.ts, useAthletes.ts, useTournaments.ts,
 *          useTournamentOverview.ts, useCategories.ts,
 *          useAgeClasses.ts
 * =====================================================
 */
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import type { LoadState } from '@/types/loadState';

/**
 * Runs a query when the screen gains focus. Coming back from an edit screen
 * therefore shows fresh data, while the old list stays visible until it arrives.
 * @param query a function that must not change on every render, so either define
 *              it outside the component or wrap it in useCallback
 * @returns the loading, error or ready state
 * @example
 * const clubs = useFocusQuery(listClubs);
 */
export function useFocusQuery<T>(query: (db: SQLiteDatabase) => Promise<T>): LoadState<T> {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState<T>>({ type: 'loading' });

  useFocusEffect(
    useCallback(() => {
      // 1. If the screen loses focus first, this answer is out of date, so ignore it.
      let isCurrent = true;

      query(db)
        .then((data) => {
          if (isCurrent) {
            setState({ type: 'ready', data });
          }
        })
        .catch((error: unknown) => {
          if (isCurrent) {
            const message = error instanceof Error ? error.message : String(error);
            setState({ type: 'error', message });
          }
        });

      return () => {
        isCurrent = false;
      };
    }, [db, query]),
  );

  return state;
}
