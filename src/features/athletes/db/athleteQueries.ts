/**
 * =====================================================
 * FILE: athleteQueries.ts
 * PURPOSE: All the SQL for athletes.
 * USED BY: useAthletes.ts, useAthleteForm.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { createId } from '@/lib/db/createId';

import type { Athlete, AthleteData, AthleteListItem, DeleteAthleteResult } from '../types';

/**
 * Reads every athlete with their club's name.
 * @returns the athletes in Portuguese alphabetical order
 */
export async function listAthletes(db: SQLiteDatabase): Promise<AthleteListItem[]> {
  const athletes = await db.getAllAsync<AthleteListItem>(
    `SELECT athletes.*, clubs.name AS clubName
     FROM athletes
     LEFT JOIN clubs ON clubs.id = athletes.clubId`,
  );

  // Sorted here because SQLite's ORDER BY would put "Álvaro" after "Zé".
  return athletes.sort((a, b) => a.name.localeCompare(b.name, 'pt'));
}

/** Reads one athlete. @returns the athlete, or null if they no longer exist */
export function getAthlete(db: SQLiteDatabase, id: string): Promise<Athlete | null> {
  return db.getFirstAsync<Athlete>('SELECT * FROM athletes WHERE id = ?', [id]);
}

/** Saves a new athlete. @returns the new athlete's id */
export async function createAthlete(db: SQLiteDatabase, athlete: AthleteData): Promise<string> {
  const id = createId();
  await db.runAsync(
    `INSERT INTO athletes (id, name, clubId, birthYear, sex, belt, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      athlete.name,
      athlete.clubId,
      athlete.birthYear,
      athlete.sex,
      athlete.belt,
      athlete.notes,
    ],
  );

  return id;
}

/** Saves changes to an athlete. */
export async function updateAthlete(
  db: SQLiteDatabase,
  id: string,
  athlete: AthleteData,
): Promise<void> {
  await db.runAsync(
    `UPDATE athletes
     SET name = ?, clubId = ?, birthYear = ?, sex = ?, belt = ?, notes = ?
     WHERE id = ?`,
    [
      athlete.name,
      athlete.clubId,
      athlete.birthYear,
      athlete.sex,
      athlete.belt,
      athlete.notes,
      id,
    ],
  );
}

/**
 * Deletes an athlete, unless they are registered in a tournament.
 * @returns 'deleted', or 'blocked' with the number of categories in the way
 */
export async function deleteAthlete(db: SQLiteDatabase, id: string): Promise<DeleteAthleteResult> {
  // Checking first gives a helpful message. The foreign key would also refuse
  // this delete, but only with a technical error.
  const row = await db.getFirstAsync<{ entryCount: number }>(
    'SELECT COUNT(*) AS entryCount FROM entries WHERE athleteId = ?',
    [id],
  );
  const entryCount = row?.entryCount ?? 0;

  if (entryCount > 0) {
    return { type: 'blocked', entryCount };
  }

  await db.runAsync('DELETE FROM athletes WHERE id = ?', [id]);

  return { type: 'deleted' };
}
