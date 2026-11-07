/**
 * =====================================================
 * FILE: tournamentQueries.ts
 * PURPOSE: All the SQL for tournaments.
 * USED BY: useTournaments.ts, useTournamentForm.ts,
 *          useTournamentOverview.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { copyCategories } from '@/features/categories';
import { DEFAULT_RULE_SET } from '@/lib/constants/fpjCategories';
import { createId } from '@/lib/db/createId';

import type { Tournament, TournamentData } from '../types';

// ---------------------------------------------
// SECTION: Helpers
// ---------------------------------------------

/** A tournament as SQLite returns it, where booleans are the numbers 0 and 1. */
type TournamentRow = Omit<Tournament, 'isArchived'> & {
  isArchived: number;
};

const SELECT_TOURNAMENT = `
  SELECT tournaments.*,
    (SELECT COUNT(*) FROM categories WHERE categories.tournamentId = tournaments.id)
      AS categoryCount,
    (SELECT COUNT(*) FROM entries
       JOIN categories ON categories.id = entries.categoryId
       WHERE categories.tournamentId = tournaments.id)
      AS entryCount,
    (SELECT COUNT(*) FROM entries
       JOIN categories ON categories.id = entries.categoryId
       WHERE categories.tournamentId = tournaments.id AND entries.status <> 'registered')
      AS weighInDoneCount
  FROM tournaments`;

function toTournament(row: TournamentRow): Tournament {
  return { ...row, isArchived: row.isArchived === 1 };
}

// ---------------------------------------------
// SECTION: Queries
// ---------------------------------------------

/**
 * Reads every tournament.
 * @returns them with the most recent date first, because that's the likely next action
 */
export async function listTournaments(db: SQLiteDatabase): Promise<Tournament[]> {
  const rows = await db.getAllAsync<TournamentRow>(
    `${SELECT_TOURNAMENT} ORDER BY tournaments.date DESC, tournaments.name`,
  );

  return rows.map(toTournament);
}

/** Reads one tournament. @returns the tournament, or null if it no longer exists */
export async function getTournament(db: SQLiteDatabase, id: string): Promise<Tournament | null> {
  const row = await db.getFirstAsync<TournamentRow>(
    `${SELECT_TOURNAMENT} WHERE tournaments.id = ?`,
    [id],
  );

  return row === null ? null : toTournament(row);
}

/**
 * Counts the categories that need a draw, because they have at least two athletes, and
 * how many of those have a locked one. A category with one athlete has nobody to draw.
 */
export async function getDrawCounts(
  db: SQLiteDatabase,
  tournamentId: string,
): Promise<{ drawableCount: number; lockedDrawCount: number }> {
  const row = await db.getFirstAsync<{ drawableCount: number; lockedDrawCount: number | null }>(
    `SELECT COUNT(*) AS drawableCount, SUM(draws.isLocked) AS lockedDrawCount
     FROM categories
     LEFT JOIN draws ON draws.categoryId = categories.id
     WHERE categories.tournamentId = ?
       AND (SELECT COUNT(*) FROM entries
            WHERE entries.categoryId = categories.id
              AND entries.status IN ('registered', 'passed')) >= 2`,
    [tournamentId],
  );

  return { drawableCount: row?.drawableCount ?? 0, lockedDrawCount: row?.lockedDrawCount ?? 0 };
}

/** Saves a new tournament. @returns the new tournament's id */
export async function createTournament(
  db: SQLiteDatabase,
  tournament: TournamentData,
): Promise<string> {
  const id = createId();
  await db.runAsync(
    `INSERT INTO tournaments (id, name, date, place, seasonYear, ruleSetId)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      tournament.name,
      tournament.date,
      tournament.place,
      tournament.seasonYear,
      DEFAULT_RULE_SET.id,
    ],
  );

  return id;
}

/** Saves changes to a tournament's details. */
export async function updateTournament(
  db: SQLiteDatabase,
  id: string,
  tournament: TournamentData,
): Promise<void> {
  await db.runAsync(
    'UPDATE tournaments SET name = ?, date = ?, place = ?, seasonYear = ? WHERE id = ?',
    [tournament.name, tournament.date, tournament.place, tournament.seasonYear, id],
  );
}

/** Archives a tournament, or brings it back. */
export async function setTournamentArchived(
  db: SQLiteDatabase,
  id: string,
  isArchived: boolean,
): Promise<void> {
  await db.runAsync('UPDATE tournaments SET isArchived = ? WHERE id = ?', [isArchived ? 1 : 0, id]);
}

/**
 * Creates a copy of a tournament with the same details and categories, ready to
 * reuse next season. Athletes, draws and matches are not copied.
 * @param name the new tournament's name
 * @returns the new tournament's id
 */
export async function duplicateTournament(
  db: SQLiteDatabase,
  source: Tournament,
  name: string,
): Promise<string> {
  const id = createId();

  // All or nothing, so that a failure can't leave a copy with half its categories.
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO tournaments (id, name, date, place, seasonYear, ruleSetId)
       SELECT ?, ?, date, place, seasonYear, ruleSetId FROM tournaments WHERE id = ?`,
      [id, name, source.id],
    );
    await copyCategories(db, source.id, id);
  });

  return id;
}
