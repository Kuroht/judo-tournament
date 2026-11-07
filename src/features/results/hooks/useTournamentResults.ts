/**
 * =====================================================
 * FILE: useTournamentResults.ts
 * PURPOSE: Loads a tournament's results.
 * USED BY: ResultsScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { listTournamentContests } from '@/features/matches';
import { useFocusQuery } from '@/hooks/useFocusQuery';

import { toCategoryResult } from '../buildResults';

/**
 * Gives a screen the results of each category with a locked draw. It reads them each
 * time the screen comes into view, so a result that has just finished shows straight away.
 * @param tournamentId the tournament to show
 */
export function useTournamentResults(tournamentId: string) {
  const query = useCallback(
    async (db: SQLiteDatabase) =>
      (await listTournamentContests(db, tournamentId)).map(toCategoryResult),
    [tournamentId],
  );

  return useFocusQuery(query);
}
