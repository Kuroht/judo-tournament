/**
 * =====================================================
 * FILE: contestQueries.ts
 * PURPOSE: Reads a category's contests from its draw and
 *          its finished matches.
 * USED BY: useCategoryContests.ts, matchQueries.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { CategoryFormat } from '@/features/categories';

import { buildCategoryContests } from '../buildCategoryContests';
import type { CategoryContests, ContestAthlete, FinishedMatch } from '../types';

type CategoryRow = {
  label: string;
  ageClassName: string | null;
  format: CategoryFormat;
  isLocked: number | null;
  drawnEntryCount: number | null;
};

/**
 * Reads a category's contests. They only exist once the draw is locked. An athlete
 * removed since the draw leaves a gap in the positions, so that draw can't be used.
 * @returns the contests, or null if the category no longer exists
 */
export async function getCategoryContests(
  db: SQLiteDatabase,
  categoryId: string,
): Promise<CategoryContests | null> {
  const category = await db.getFirstAsync<CategoryRow>(
    `SELECT categories.label, age_classes.name AS ageClassName, categories.format,
       draws.isLocked, draws.entryCount AS drawnEntryCount
     FROM categories
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     LEFT JOIN draws ON draws.categoryId = categories.id
     WHERE categories.id = ?`,
    [categoryId],
  );

  if (category === null) {
    return null;
  }

  const athletes = await db.getAllAsync<ContestAthlete>(
    `SELECT entries.id AS entryId, athletes.name, athletes.clubId, clubs.name AS clubName,
       entries.drawPosition AS position, entries.weighedKg
     FROM entries
     JOIN athletes ON athletes.id = entries.athleteId
     LEFT JOIN clubs ON clubs.id = athletes.clubId
     WHERE entries.categoryId = ? AND entries.drawPosition IS NOT NULL`,
    [categoryId],
  );
  const finished = await db.getAllAsync<FinishedMatch>(
    `SELECT matchKey, whiteEntryId, blueEntryId, winnerEntryId, resultType,
       COALESCE(durationSeconds, 0) AS durationSeconds
     FROM matches
     WHERE categoryId = ? AND status = 'finished' AND matchKey IS NOT NULL`,
    [categoryId],
  );
  const running = await db.getAllAsync<{ matchKey: string }>(
    `SELECT matchKey FROM matches
     WHERE categoryId = ? AND status = 'running' AND matchKey IS NOT NULL`,
    [categoryId],
  );

  const isReady = category.isLocked === 1 && athletes.length === category.drawnEntryCount;

  return {
    categoryId,
    label: category.label,
    ageClassName: category.ageClassName,
    format: category.format,
    isReady,
    runningKeys: running.map((row) => row.matchKey),
    contests: isReady ? buildCategoryContests(category.format, athletes, finished) : [],
  };
}
