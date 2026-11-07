/**
 * =====================================================
 * FILE: weighInQueries.ts
 * PURPOSE: All the SQL for the weigh-in.
 * USED BY: useWeighIn.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { createCategory, FREE_GROUP_FORMAT } from '@/features/categories';

import type { EntryStatus, WeighInCategory, WeighInData, WeighInEntry } from '../types';
import { sortWeighInEntries } from '../weighInList';
import { evaluateWeight } from '../weightRules';

// Heaviest categories have no upper limit, so "IS NULL" puts them after the others.
const CATEGORY_ORDER = `age_classes.sortOrder IS NULL, age_classes.sortOrder, categories.sex,
  categories.maxKg IS NULL, categories.maxKg, categories.label`;

/** A row as SQLite returns it, where booleans are the numbers 0 and 1. */
type WithNumberBoolean<T> = Omit<T, 'isFreeGrouping' | 'toleranceGrams'> & {
  isFreeGrouping: number;
  toleranceGrams: number | null;
};

// A category without an age class has no tolerance.
function fromRow<T>(row: WithNumberBoolean<T>) {
  return {
    ...row,
    isFreeGrouping: row.isFreeGrouping === 1,
    toleranceGrams: row.toleranceGrams ?? 0,
  };
}

/**
 * Works out pass or fail from the category's current limits. The saved status could
 * be out of date, because the trainer can edit a category's limits after the weigh-in.
 */
function withCurrentResult(entry: WeighInEntry): WeighInEntry {
  if (entry.weighedKg === null || (entry.status !== 'passed' && entry.status !== 'failed')) {
    return entry;
  }

  const status = evaluateWeight(entry.weighedKg, entry) === 'pass' ? 'passed' : 'failed';

  return { ...entry, status };
}

/** Reads a tournament's registrations and categories for the weigh-in. */
export async function getWeighInData(
  db: SQLiteDatabase,
  tournamentId: string,
): Promise<WeighInData> {
  const entries = await db.getAllAsync<WithNumberBoolean<WeighInEntry>>(
    `SELECT entries.id AS entryId, athletes.id AS athleteId, athletes.name,
       clubs.name AS clubName, athletes.sex AS athleteSex,
       categories.id AS categoryId, categories.label AS categoryLabel,
       categories.sex AS categorySex, categories.ageClassId,
       age_classes.name AS ageClassName, categories.minKg, categories.maxKg,
       categories.isFreeGrouping, age_classes.weightToleranceGrams AS toleranceGrams,
       entries.weighedKg, entries.status
     FROM entries
     JOIN athletes ON athletes.id = entries.athleteId
     JOIN categories ON categories.id = entries.categoryId
     LEFT JOIN clubs ON clubs.id = athletes.clubId
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     WHERE categories.tournamentId = ?
     ORDER BY ${CATEGORY_ORDER}`,
    [tournamentId],
  );

  const categories = await db.getAllAsync<WithNumberBoolean<WeighInCategory>>(
    `SELECT categories.id, categories.label, categories.sex, categories.ageClassId,
       age_classes.name AS ageClassName, categories.minKg, categories.maxKg,
       categories.isFreeGrouping, age_classes.weightToleranceGrams AS toleranceGrams
     FROM categories
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     WHERE categories.tournamentId = ?
     ORDER BY ${CATEGORY_ORDER}`,
    [tournamentId],
  );

  return {
    entries: sortWeighInEntries(
      entries.map((row) => withCurrentResult(fromRow<WeighInEntry>(row) as WeighInEntry)),
    ),
    categories: categories.map((row) => fromRow<WeighInCategory>(row) as WeighInCategory),
  };
}

/** Saves a weight and whether it passed. */
export async function saveWeight(
  db: SQLiteDatabase,
  entryId: string,
  kg: number,
  status: EntryStatus,
): Promise<void> {
  await db.runAsync(
    'UPDATE entries SET weighedKg = ?, isWeighedIn = 1, status = ? WHERE id = ?',
    [kg, status, entryId],
  );
}

/** Marks an athlete as not having turned up, removing any weight. */
export async function markNoShow(db: SQLiteDatabase, entryId: string): Promise<void> {
  await db.runAsync(
    `UPDATE entries SET weighedKg = NULL, isWeighedIn = 0, status = 'noShow' WHERE id = ?`,
    [entryId],
  );
}

/** Puts an athlete back to "still to be weighed", to correct a mistake. */
export async function clearWeighIn(db: SQLiteDatabase, entryId: string): Promise<void> {
  await db.runAsync(
    `UPDATE entries SET weighedKg = NULL, isWeighedIn = 0, status = 'registered' WHERE id = ?`,
    [entryId],
  );
}

async function isAlreadyInCategory(
  db: SQLiteDatabase,
  athleteId: string,
  categoryId: string,
): Promise<boolean> {
  const row = await db.getFirstAsync(
    'SELECT id FROM entries WHERE athleteId = ? AND categoryId = ?',
    [athleteId, categoryId],
  );

  return row !== null;
}

/**
 * Moves a registration to another category.
 * @param status the entry's status in its new category
 * @returns false if the athlete is already registered there, so nothing changed
 */
export async function moveEntry(
  db: SQLiteDatabase,
  entry: WeighInEntry,
  targetCategoryId: string,
  status: EntryStatus,
): Promise<boolean> {
  if (await isAlreadyInCategory(db, entry.athleteId, targetCategoryId)) {
    return false;
  }

  await db.runAsync('UPDATE entries SET categoryId = ?, status = ? WHERE id = ?', [
    targetCategoryId,
    status,
    entry.entryId,
  ]);

  return true;
}

/**
 * Creates a new free group and moves an athlete into it.
 * @param label the new group's name
 * @returns false if this age class and sex already has a group with that name
 */
export async function createFreeGroupAndMove(
  db: SQLiteDatabase,
  tournamentId: string,
  entry: WeighInEntry,
  label: string,
): Promise<boolean> {
  const existing = await db.getFirstAsync(
    `SELECT id FROM categories
     WHERE tournamentId = ? AND ageClassId IS ? AND sex = ? AND label = ? COLLATE NOCASE`,
    [tournamentId, entry.ageClassId, entry.categorySex, label],
  );

  if (existing !== null) {
    return false;
  }

  // All or nothing, so that a failure can't leave an empty group behind.
  await db.withTransactionAsync(async () => {
    const categoryId = await createCategory(db, tournamentId, {
      ageClassId: entry.ageClassId,
      sex: entry.categorySex,
      label,
      minKg: null,
      maxKg: null,
      format: FREE_GROUP_FORMAT,
      isFreeGrouping: true,
    });
    await db.runAsync('UPDATE entries SET categoryId = ? WHERE id = ?', [categoryId, entry.entryId]);
  });

  return true;
}
