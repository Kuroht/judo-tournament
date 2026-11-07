/**
 * =====================================================
 * FILE: categoryQueries.ts
 * PURPOSE: All the SQL for a tournament's categories.
 * USED BY: useCategories.ts, useCategoryForm.ts,
 *          useAddFpjCategories.ts, and tournaments
 *          through index.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { createId } from '@/lib/db/createId';

import { DEFAULT_CATEGORY_FORMAT, FREE_GROUP_FORMAT } from '../categoryFormats';
import type {
  AddFpjCategoriesResult,
  AgeClassOption,
  Category,
  CategoryData,
  CategoryFormat,
  CategoryListItem,
  CategorySex,
  DeleteCategoryResult,
} from '../types';

// ---------------------------------------------
// SECTION: Helpers
// ---------------------------------------------

/** A category as SQLite returns it, where booleans are the numbers 0 and 1. */
type CategoryRow = Omit<Category, 'isFreeGrouping'> & {
  isFreeGrouping: number;
};

async function insertCategory(
  db: SQLiteDatabase,
  tournamentId: string,
  category: CategoryData,
): Promise<string> {
  const id = createId();
  await db.runAsync(
    `INSERT INTO categories
       (id, tournamentId, ageClassId, sex, label, minKg, maxKg, format, isFreeGrouping)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      tournamentId,
      category.ageClassId,
      category.sex,
      category.label,
      category.minKg,
      category.maxKg,
      category.format,
      category.isFreeGrouping ? 1 : 0,
    ],
  );

  return id;
}

// ---------------------------------------------
// SECTION: Reading
// ---------------------------------------------

/**
 * Reads a tournament's categories.
 * @returns them ordered by age class, then sex, then weight with "+" last
 */
export async function listCategories(
  db: SQLiteDatabase,
  tournamentId: string,
): Promise<CategoryListItem[]> {
  const rows = await db.getAllAsync<CategoryRow & { ageClassName: string | null }>(
    `SELECT categories.*, age_classes.name AS ageClassName
     FROM categories
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     WHERE categories.tournamentId = ?
     ORDER BY age_classes.sortOrder IS NULL, age_classes.sortOrder,
              categories.sex, categories.maxKg IS NULL, categories.maxKg, categories.label`,
    [tournamentId],
  );

  return rows.map((row) => ({ ...row, isFreeGrouping: row.isFreeGrouping === 1 }));
}

/** Reads one category. @returns the category, or null if it no longer exists */
export async function getCategory(db: SQLiteDatabase, id: string): Promise<Category | null> {
  const row = await db.getFirstAsync<CategoryRow>('SELECT * FROM categories WHERE id = ?', [id]);

  return row === null ? null : { ...row, isFreeGrouping: row.isFreeGrouping === 1 };
}

/** Reads the age classes in FPJ order, for choosing which ones to add. */
export async function listAgeClasses(db: SQLiteDatabase): Promise<AgeClassOption[]> {
  const rows = await db.getAllAsync<{
    id: string;
    name: string;
    isVerified: number;
    hasWeightCategories: number;
  }>('SELECT id, name, isVerified, hasWeightCategories FROM age_classes ORDER BY sortOrder');

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    isVerified: row.isVerified === 1,
    hasWeightCategories: row.hasWeightCategories === 1,
  }));
}

// ---------------------------------------------
// SECTION: Writing
// ---------------------------------------------

/** Saves a new category. @returns the new category's id */
export function createCategory(
  db: SQLiteDatabase,
  tournamentId: string,
  category: CategoryData,
): Promise<string> {
  return insertCategory(db, tournamentId, category);
}

/** Saves changes to a category. */
export async function updateCategory(
  db: SQLiteDatabase,
  id: string,
  category: CategoryData,
): Promise<void> {
  await db.runAsync(
    `UPDATE categories
     SET ageClassId = ?, sex = ?, label = ?, minKg = ?, maxKg = ?, format = ?, isFreeGrouping = ?
     WHERE id = ?`,
    [
      category.ageClassId,
      category.sex,
      category.label,
      category.minKg,
      category.maxKg,
      category.format,
      category.isFreeGrouping ? 1 : 0,
      id,
    ],
  );
}

/**
 * Deletes a category, unless athletes are registered in it. Deleting would
 * otherwise also delete those registrations, without any warning.
 * @returns 'deleted', or 'blocked' with the number of registrations in the way
 */
export async function deleteCategory(
  db: SQLiteDatabase,
  id: string,
): Promise<DeleteCategoryResult> {
  const row = await db.getFirstAsync<{ entryCount: number }>(
    'SELECT COUNT(*) AS entryCount FROM entries WHERE categoryId = ?',
    [id],
  );
  const entryCount = row?.entryCount ?? 0;

  if (entryCount > 0) {
    return { type: 'blocked', entryCount };
  }

  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);

  return { type: 'deleted' };
}

/**
 * Adds categories from the FPJ age classes to a tournament. Categories it
 * already has are skipped, so running this twice is safe. A weight category
 * the trainer has renamed no longer counts as existing, so it would be added again.
 * @param ageClassIds the chosen age classes
 * @param sexes the chosen sexes
 * @param freeGroupLabel the name for the group of an age class with no weights
 * @returns how many were added and skipped
 */
export async function addFpjCategories(
  db: SQLiteDatabase,
  tournamentId: string,
  ageClassIds: readonly string[],
  sexes: readonly CategorySex[],
  freeGroupLabel: string,
): Promise<AddFpjCategoriesResult> {
  const result: AddFpjCategoriesResult = { addedCount: 0, skippedCount: 0 };

  async function addIfMissing(category: CategoryData) {
    // A free group's name depends on the app's language, so comparing names would
    // create a second group after switching language. There is one per age class and sex.
    const existing = category.isFreeGrouping
      ? await db.getFirstAsync(
          `SELECT id FROM categories
           WHERE tournamentId = ? AND ageClassId = ? AND sex = ? AND isFreeGrouping = 1`,
          [tournamentId, category.ageClassId, category.sex],
        )
      : await db.getFirstAsync(
          `SELECT id FROM categories
           WHERE tournamentId = ? AND ageClassId = ? AND sex = ? AND label = ?`,
          [tournamentId, category.ageClassId, category.sex, category.label],
        );

    if (existing !== null) {
      result.skippedCount += 1;
      return;
    }

    await insertCategory(db, tournamentId, category);
    result.addedCount += 1;
  }

  // All or nothing, so that a failure can't leave half an age class behind.
  await db.withTransactionAsync(async () => {
    for (const ageClassId of ageClassIds) {
      for (const sex of sexes) {
        const templates = await db.getAllAsync<{ label: string; minKg: number | null; maxKg: number | null }>(
          `SELECT label, minKg, maxKg FROM weight_templates
           WHERE ageClassId = ? AND sex = ?
           ORDER BY sortOrder`,
          [ageClassId, sex],
        );

        // 1. No weights means free grouping, so one group holds everyone until
        //    the weigh-in, when the trainer creates groups from the real weights.
        if (templates.length === 0) {
          await addIfMissing({
            ageClassId,
            sex,
            label: freeGroupLabel,
            minKg: null,
            maxKg: null,
            format: FREE_GROUP_FORMAT,
            isFreeGrouping: true,
          });
        }

        for (const template of templates) {
          await addIfMissing({
            ageClassId,
            sex,
            label: template.label,
            minKg: template.minKg,
            maxKg: template.maxKg,
            format: DEFAULT_CATEGORY_FORMAT,
            isFreeGrouping: false,
          });
        }
      }
    }
  });

  return result;
}

/**
 * Copies the categories of one tournament into another, without any athletes,
 * draws or matches. Call it inside the caller's transaction.
 */
export async function copyCategories(
  db: SQLiteDatabase,
  fromTournamentId: string,
  toTournamentId: string,
): Promise<void> {
  const rows = await db.getAllAsync<CategoryRow & { format: CategoryFormat }>(
    'SELECT * FROM categories WHERE tournamentId = ?',
    [fromTournamentId],
  );

  for (const row of rows) {
    await insertCategory(db, toTournamentId, { ...row, isFreeGrouping: row.isFreeGrouping === 1 });
  }
}
