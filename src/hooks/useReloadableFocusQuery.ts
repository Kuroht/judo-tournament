/**
 * =====================================================
 * FILE: useReloadableFocusQuery.ts
 * PURPOSE: Reads data when a screen comes into view, and
 *          again whenever the screen asks for fresh data.
 * USED BY: useFocusQuery.ts, useCategoryRegistration.ts,
 *          useWeighIn.ts
 * =====================================================
 */
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

import type { LoadState } from '@/types/loadState';

/**
 * Runs a query when the screen gains focus, and each time reload is called.
 * The old data stays visible until the new data arrives, so lists don't flicker.
 * @param query a function that must not change on every render, so either define
 *              it outside the component or wrap it in useCallback
 * @returns the loading, error or ready state, and the reload function
 */
export function useReloadableFocusQuery<T>(query: (db: SQLiteDatabase) => Promise<T>) {
  const db = useSQLiteContext();
  const [state, setState] = useState<LoadState<T>>({ type: 'loading' });
  // Numbers each read, so that only the newest read may update the screen. An older
  // read that finishes late would otherwise replace newer data with out-of-date data.
  const latestRead = useRef(0);

  const reload = useCallback(() => {
    latestRead.current += 1;
    const thisRead = latestRead.current;

    return query(db)
      .then((data) => {
        if (thisRead === latestRead.current) {
          setState({ type: 'ready', data });
        }
      })
      .catch((error: unknown) => {
        if (thisRead === latestRead.current) {
          const message = error instanceof Error ? error.message : String(error);
          setState({ type: 'error', message });
        }
      });
  }, [db, query]);

  useFocusEffect(
    useCallback(() => {
      reload();

      // Leaving the screen makes any read still running count as out of date.
      return () => {
        latestRead.current += 1;
      };
    }, [reload]),
  );

  return { state, reload };
}
