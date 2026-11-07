/**
 * =====================================================
 * FILE: useFocusQuery.ts
 * PURPOSE: Reads data from the database each time a screen
 *          comes into view.
 * USED BY: useClubs.ts, useAthletes.ts, useTournaments.ts,
 *          useTournamentOverview.ts, useCategories.ts,
 *          useAgeClasses.ts, useRegistrationSummaries.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { LoadState } from '@/types/loadState';

import { useReloadableFocusQuery } from './useReloadableFocusQuery';

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
  return useReloadableFocusQuery(query).state;
}
