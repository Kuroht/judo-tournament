/**
 * =====================================================
 * FILE: registrationQueries.ts
 * PURPOSE: All the SQL for registering athletes into
 *          categories.
 * USED BY: useRegistrationSummaries.ts,
 *          useCategoryRegistration.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { createId } from '@/lib/db/createId';

import type {
  CategoryRegistration,
  CategoryRules,
  RegisteredAthlete,
  RegistrationAthlete,
  RegistrationSummary,
} from '../types';

/**
 * Reads a tournament's categories with how many athletes are in each.
 * @returns them ordered by age class, then sex, then weight with "+" last
 */
export function listRegistrationSummaries(
  db: SQLiteDatabase,
  tournamentId: string,
): Promise<RegistrationSummary[]> {
  return db.getAllAsync<RegistrationSummary>(
    `SELECT categories.id AS categoryId, categories.label, categories.sex,
       age_classes.name AS ageClassName,
       (SELECT COUNT(*) FROM entries WHERE entries.categoryId = categories.id) AS entryCount
     FROM categories
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     WHERE categories.tournamentId = ?
     ORDER BY age_classes.sortOrder IS NULL, age_classes.sortOrder,
              categories.sex, categories.maxKg IS NULL, categories.maxKg, categories.label`,
    [tournamentId],
  );
}

/**
 * Reads one category with the athletes in it and the athletes that could join.
 * @returns all three, or null if the category no longer exists
 */
export async function getCategoryRegistration(
  db: SQLiteDatabase,
  categoryId: string,
): Promise<CategoryRegistration | null> {
  const category = await db.getFirstAsync<CategoryRules>(
    `SELECT categories.id, categories.label, categories.sex,
       age_classes.name AS ageClassName, age_classes.minAge, age_classes.maxAge,
       tournaments.seasonYear
     FROM categories
     JOIN tournaments ON tournaments.id = categories.tournamentId
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     WHERE categories.id = ?`,
    [categoryId],
  );

  if (category === null) {
    return null;
  }

  const registered = await db.getAllAsync<RegisteredAthlete>(
    `SELECT entries.id AS entryId, athletes.id AS athleteId, athletes.name,
       clubs.name AS clubName, athletes.birthYear, athletes.sex
     FROM entries
     JOIN athletes ON athletes.id = entries.athleteId
     LEFT JOIN clubs ON clubs.id = athletes.clubId
     WHERE entries.categoryId = ?`,
    [categoryId],
  );

  const available = await db.getAllAsync<RegistrationAthlete>(
    `SELECT athletes.id AS athleteId, athletes.name, clubs.name AS clubName,
       athletes.birthYear, athletes.sex
     FROM athletes
     LEFT JOIN clubs ON clubs.id = athletes.clubId
     WHERE athletes.id NOT IN (SELECT athleteId FROM entries WHERE categoryId = ?)`,
    [categoryId],
  );

  // Sorted here because SQLite's ORDER BY would put "Álvaro" after "Zé".
  const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'pt');

  return {
    category,
    registered: registered.sort(byName),
    available: available.sort(byName),
  };
}

/**
 * Registers an athlete in a category. If they're already in it, nothing changes,
 * so adding the same athlete twice can never create a second registration.
 */
export async function addEntry(
  db: SQLiteDatabase,
  categoryId: string,
  athleteId: string,
): Promise<void> {
  await db.runAsync(
    'INSERT OR IGNORE INTO entries (id, athleteId, categoryId) VALUES (?, ?, ?)',
    [createId(), athleteId, categoryId],
  );
}

/** Removes a registration. The athlete stays in the athletes list. */
export async function removeEntry(db: SQLiteDatabase, entryId: string): Promise<void> {
  await db.runAsync('DELETE FROM entries WHERE id = ?', [entryId]);
}
