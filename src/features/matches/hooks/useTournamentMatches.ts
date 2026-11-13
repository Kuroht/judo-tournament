/**
 * =====================================================
 * FILE: useTournamentMatches.ts
 * PURPOSE: Loads a tournament's match list, and who fought
 *          last, so the next match can give them a rest.
 * USED BY: MatchListScreen.tsx, UpcomingMatches.tsx,
 *          NextMatchButton.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';

import { getLastFinishedPair, listTournamentContests } from '../db/contestQueries';
import { buildMatchList } from '../matchList';

/**
 * Gives a screen the matches of a tournament. It reads them each time the screen comes
 * into view, so a match that has just finished shows straight away.
 * @param tournamentId the tournament to show
 */
export function useTournamentMatches(tournamentId: string) {
  const query = useCallback(
    async (db: SQLiteDatabase) => ({
      items: buildMatchList(await listTournamentContests(db, tournamentId)),
      lastPair: await getLastFinishedPair(db, tournamentId),
    }),
    [tournamentId],
  );

  return useFocusQuery(query);
}
