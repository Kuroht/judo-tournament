/**
 * =====================================================
 * FILE: useTournamentMatches.ts
 * PURPOSE: Loads a tournament's match list.
 * USED BY: MatchListScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';

import { listTournamentContests } from '../db/contestQueries';
import { buildMatchList } from '../matchList';

/**
 * Gives a screen the matches of a tournament. It reads them each time the screen comes
 * into view, so a match that has just finished shows straight away.
 * @param tournamentId the tournament to show
 */
export function useTournamentMatches(tournamentId: string) {
  const query = useCallback(
    async (db: SQLiteDatabase) => buildMatchList(await listTournamentContests(db, tournamentId)),
    [tournamentId],
  );

  return useFocusQuery(query);
}
