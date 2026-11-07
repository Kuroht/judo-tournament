/**
 * =====================================================
 * FILE: drawQueries.ts
 * PURPOSE: All the SQL for draws.
 * USED BY: useDrawSummaries.ts, useCategoryDraw.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { CategoryFormat } from '@/features/categories';
import { getCurrentStatus, type EntryStatus } from '@/features/weigh-in';
import { createId } from '@/lib/db/createId';

import type { CategoryDraw, DrawEntry, DrawSummary } from '../types';

/** Reads a tournament's categories with their athlete counts and draw states. */
export async function listDrawSummaries(
  db: SQLiteDatabase,
  tournamentId: string,
): Promise<DrawSummary[]> {
  const rows = await db.getAllAsync<Omit<DrawSummary, 'drawState'> & { isLocked: number | null }>(
    `SELECT categories.id AS categoryId, categories.label, categories.sex,
       age_classes.name AS ageClassName, draws.isLocked,
       (SELECT COUNT(*) FROM entries
          WHERE entries.categoryId = categories.id
          AND entries.status IN ('registered', 'passed')) AS entryCount
     FROM categories
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     LEFT JOIN draws ON draws.categoryId = categories.id
     WHERE categories.tournamentId = ?
     ORDER BY age_classes.sortOrder IS NULL, age_classes.sortOrder, categories.sex,
       categories.maxKg IS NULL, categories.maxKg, categories.label`,
    [tournamentId],
  );

  return rows.map(({ isLocked, ...row }) => {
    let drawState: DrawSummary['drawState'] = 'none';
    if (isLocked !== null) {
      drawState = isLocked === 1 ? 'locked' : 'draft';
    }

    return { ...row, drawState };
  });
}

type CategoryRow = {
  categoryId: string;
  label: string;
  sex: 'male' | 'female' | 'mixed';
  ageClassName: string | null;
  format: CategoryFormat;
  minKg: number | null;
  maxKg: number | null;
  isFreeGrouping: number;
  toleranceGrams: number | null;
  seed: string | null;
  drawnEntryCount: number | null;
  isLocked: number | null;
};

type EntryRow = DrawEntry & {
  status: EntryStatus;
  weighedKg: number | null;
};

/**
 * Reads one category's draw. Athletes who failed the weigh-in, didn't show or
 * withdrew are left out. Pass or fail comes from the category's current limits.
 * @returns the draw, or null if the category no longer exists
 */
export async function getCategoryDraw(
  db: SQLiteDatabase,
  categoryId: string,
): Promise<CategoryDraw | null> {
  const category = await db.getFirstAsync<CategoryRow>(
    `SELECT categories.id AS categoryId, categories.label, categories.sex,
       age_classes.name AS ageClassName, categories.format, categories.minKg, categories.maxKg,
       categories.isFreeGrouping, age_classes.weightToleranceGrams AS toleranceGrams,
       draws.seed, draws.entryCount AS drawnEntryCount, draws.isLocked
     FROM categories
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     LEFT JOIN draws ON draws.categoryId = categories.id
     WHERE categories.id = ?`,
    [categoryId],
  );

  if (category === null) {
    return null;
  }

  const rows = await db.getAllAsync<EntryRow>(
    `SELECT entries.id AS entryId, athletes.name, athletes.clubId, clubs.name AS clubName,
       entries.seed, entries.drawPosition, entries.status, entries.weighedKg
     FROM entries
     JOIN athletes ON athletes.id = entries.athleteId
     LEFT JOIN clubs ON clubs.id = athletes.clubId
     WHERE entries.categoryId = ?`,
    [categoryId],
  );

  const limits = {
    minKg: category.minKg,
    maxKg: category.maxKg,
    isFreeGrouping: category.isFreeGrouping === 1,
    toleranceGrams: category.toleranceGrams ?? 0,
  };
  const competing = rows
    .map((row) => ({ ...row, status: getCurrentStatus(row.status, row.weighedKg, limits) }))
    .filter((row) => row.status === 'registered' || row.status === 'passed')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'));

  return {
    categoryId: category.categoryId,
    label: category.label,
    sex: category.sex,
    ageClassName: category.ageClassName,
    format: category.format,
    entries: competing,
    unweighedCount: competing.filter((row) => row.status === 'registered').length,
    seed: category.seed,
    drawnEntryCount: category.drawnEntryCount,
    isLocked: category.isLocked === 1,
  };
}

/** Sets or clears an athlete's seed number. */
export async function setEntrySeed(
  db: SQLiteDatabase,
  entryId: string,
  seed: number | null,
): Promise<void> {
  await db.runAsync('UPDATE entries SET seed = ? WHERE id = ?', [seed, entryId]);
}

/**
 * Saves a draw, replacing any earlier draw of this category.
 * @param seed the text the draw's random numbers came from
 * @param positions each athlete's position, by entry id
 */
export async function saveDraw(
  db: SQLiteDatabase,
  categoryId: string,
  seed: string,
  positions: ReadonlyMap<string, number>,
): Promise<void> {
  // All or nothing, so that a failure can't leave half the athletes placed.
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO draws (id, categoryId, seed, entryCount, isLocked) VALUES (?, ?, ?, ?, 0)
       ON CONFLICT (categoryId) DO UPDATE
       SET seed = excluded.seed, entryCount = excluded.entryCount, isLocked = 0`,
      [createId(), categoryId, seed, positions.size],
    );
    await db.runAsync('UPDATE entries SET drawPosition = NULL WHERE categoryId = ?', [categoryId]);

    for (const [entryId, position] of positions) {
      await db.runAsync('UPDATE entries SET drawPosition = ? WHERE id = ?', [position, entryId]);
    }
  });
}

/** Removes a draw, so that seeds can be changed and it can start again. */
export async function clearDraw(db: SQLiteDatabase, categoryId: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM draws WHERE categoryId = ?', [categoryId]);
    await db.runAsync('UPDATE entries SET drawPosition = NULL WHERE categoryId = ?', [categoryId]);
  });
}

/** Swaps two athletes' positions, for a correction before the draw is locked. */
export async function swapDrawPositions(
  db: SQLiteDatabase,
  first: DrawEntry,
  second: DrawEntry,
): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE entries SET drawPosition = ? WHERE id = ?', [
      second.drawPosition,
      first.entryId,
    ]);
    await db.runAsync('UPDATE entries SET drawPosition = ? WHERE id = ?', [
      first.drawPosition,
      second.entryId,
    ]);
  });
}

/** Locks or unlocks a draw. */
export async function setDrawLocked(
  db: SQLiteDatabase,
  categoryId: string,
  isLocked: boolean,
): Promise<void> {
  await db.runAsync('UPDATE draws SET isLocked = ? WHERE categoryId = ?', [
    isLocked ? 1 : 0,
    categoryId,
  ]);
}

/** Changes a category's competition format. */
export async function setCategoryFormat(
  db: SQLiteDatabase,
  categoryId: string,
  format: CategoryFormat,
): Promise<void> {
  await db.runAsync('UPDATE categories SET format = ? WHERE id = ?', [format, categoryId]);
}
