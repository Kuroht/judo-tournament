/**
 * =====================================================
 * FILE: clubQueries.ts
 * PURPOSE: All the SQL for clubs.
 * USED BY: useClubs.ts, useClubForm.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { createId } from '@/lib/db/createId';
import { normalizeText } from '@/lib/text/matchesSearch';

import type { Club, ClubListItem, DeleteClubResult } from '../types';

/**
 * Reads every club with its athlete count.
 * @returns the clubs in Portuguese alphabetical order
 */
export async function listClubs(db: SQLiteDatabase): Promise<ClubListItem[]> {
  const clubs = await db.getAllAsync<ClubListItem>(
    `SELECT clubs.id, clubs.name, COUNT(athletes.id) AS athleteCount
     FROM clubs
     LEFT JOIN athletes ON athletes.clubId = clubs.id
     GROUP BY clubs.id`,
  );

  // Sorted here because SQLite's ORDER BY would put "Águia" after "Zebra".
  return clubs.sort((a, b) => a.name.localeCompare(b.name, 'pt'));
}

/** Reads one club. @returns the club, or null if it no longer exists */
export function getClub(db: SQLiteDatabase, id: string): Promise<Club | null> {
  return db.getFirstAsync<Club>('SELECT id, name FROM clubs WHERE id = ?', [id]);
}

/**
 * Checks if another club already has this name, ignoring accents and capitals.
 * Duplicates would split one club into two rows in the medal table.
 * @param exceptId the club being edited, which may keep its own name
 */
export async function isClubNameTaken(
  db: SQLiteDatabase,
  name: string,
  exceptId: string | null,
): Promise<boolean> {
  const clubs = await db.getAllAsync<Club>('SELECT id, name FROM clubs');

  return clubs.some(
    (club) => club.id !== exceptId && normalizeText(club.name) === normalizeText(name),
  );
}

/** Saves a new club. @returns the new club's id */
export async function createClub(db: SQLiteDatabase, name: string): Promise<string> {
  const id = createId();
  await db.runAsync('INSERT INTO clubs (id, name) VALUES (?, ?)', [id, name]);

  return id;
}

/** Renames a club. */
export async function updateClub(db: SQLiteDatabase, id: string, name: string): Promise<void> {
  await db.runAsync('UPDATE clubs SET name = ? WHERE id = ?', [name, id]);
}

/**
 * Deletes a club, unless athletes still belong to it.
 * @returns 'deleted', or 'blocked' with the number of athletes in the way
 */
export async function deleteClub(db: SQLiteDatabase, id: string): Promise<DeleteClubResult> {
  // Checking first gives a helpful message. The foreign key would also refuse
  // this delete, but only with a technical error.
  const row = await db.getFirstAsync<{ athleteCount: number }>(
    'SELECT COUNT(*) AS athleteCount FROM athletes WHERE clubId = ?',
    [id],
  );
  const athleteCount = row?.athleteCount ?? 0;

  if (athleteCount > 0) {
    return { type: 'blocked', athleteCount };
  }

  await db.runAsync('DELETE FROM clubs WHERE id = ?', [id]);

  return { type: 'deleted' };
}
