/**
 * =====================================================
 * FILE: historyQueries.ts
 * PURPOSE: Reads one athlete's matches and places in every
 *          tournament.
 * USED BY: useAthleteHistory.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { getCategoryContests } from '@/features/matches';

import { findPlace, toHistoryMatches } from '../buildResults';
import type { HistoryCategory } from '../types';

type EntryRow = {
  entryId: string;
  categoryId: string;
  tournamentName: string;
};

/** Reads a tournament's name, which goes at the top of what is printed. */
export async function getTournamentName(db: SQLiteDatabase, tournamentId: string): Promise<string> {
  const row = await db.getFirstAsync<{ name: string }>(
    'SELECT name FROM tournaments WHERE id = ?',
    [tournamentId],
  );

  return row?.name ?? '';
}

/**
 * Reads an athlete's history, newest tournament first. It's worked out from each
 * category's contests, so that a result that no longer counts isn't shown.
 * @returns the categories where they have fought
 */
export async function getAthleteHistory(
  db: SQLiteDatabase,
  athleteId: string,
): Promise<HistoryCategory[]> {
  const entries = await db.getAllAsync<EntryRow>(
    `SELECT entries.id AS entryId, entries.categoryId, tournaments.name AS tournamentName
     FROM entries
     JOIN categories ON categories.id = entries.categoryId
     JOIN tournaments ON tournaments.id = categories.tournamentId
     WHERE entries.athleteId = ?
     ORDER BY tournaments.date DESC, tournaments.name`,
    [athleteId],
  );
  const history: HistoryCategory[] = [];

  for (const entry of entries) {
    const category = await getCategoryContests(db, entry.categoryId);
    const matches = category === null ? [] : toHistoryMatches(category, entry.entryId);

    if (category !== null && matches.length > 0) {
      history.push({
        entryId: entry.entryId,
        tournamentName: entry.tournamentName,
        categoryTitle: category.title,
        place: findPlace(category, entry.entryId),
        matches,
      });
    }
  }

  return history;
}
