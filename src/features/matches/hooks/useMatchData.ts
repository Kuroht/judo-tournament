/**
 * =====================================================
 * FILE: useMatchData.ts
 * PURPOSE: Loads one saved match.
 * USED BY: MatchScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useReloadableFocusQuery } from '@/hooks/useReloadableFocusQuery';

import { getMatchData } from '../db/matchQueries';

/**
 * Gives a screen one match, and a way to read it again.
 * @param categoryId the match's category
 * @param matchKey which contest in that category
 */
export function useMatchData(categoryId: string, matchKey: string) {
  const query = useCallback(
    (database: SQLiteDatabase) => getMatchData(database, categoryId, matchKey),
    [categoryId, matchKey],
  );

  return useReloadableFocusQuery(query);
}
