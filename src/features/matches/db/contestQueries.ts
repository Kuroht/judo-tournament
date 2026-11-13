/**
 * =====================================================
 * FILE: contestQueries.ts
 * PURPOSE: Reads contests from each category's draw and
 *          finished matches.
 * USED BY: useCategoryContests.ts, useTournamentMatches.ts,
 *          matchQueries.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { CategoryFormat } from '@/features/categories';

import { resolveCategory } from '../buildCategoryContests';
import type { CategoryContests, ContestAthlete, FinishedMatch } from '../types';

type CategoryRow = {
  label: string;
  sex: string;
  ageClassName: string | null;
  format: CategoryFormat;
  isLocked: number | null;
  drawnEntryCount: number | null;
};

type RunningRow = {
  matchKey: string;
  whiteEntryId: string;
  blueEntryId: string;
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
    `SELECT categories.label, categories.sex, age_classes.name AS ageClassName,
       categories.format, draws.isLocked, draws.entryCount AS drawnEntryCount
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
  const running = await db.getAllAsync<RunningRow>(
    `SELECT matchKey, whiteEntryId, blueEntryId FROM matches
     WHERE categoryId = ? AND status = 'running' AND matchKey IS NOT NULL`,
    [categoryId],
  );

  const isReady = category.isLocked === 1 && athletes.length === category.drawnEntryCount;
  const { contests, places } = isReady
    ? resolveCategory(category.format, athletes, finished)
    : { contests: [], places: [] };
  // A running match only counts if these are still its athletes. After a result is
  // corrected, the later contests can have changed.
  const runningKeys = contests
    .filter((contest) =>
      running.some(
        (row) =>
          row.matchKey === contest.key &&
          row.whiteEntryId === contest.white?.entryId &&
          row.blueEntryId === contest.blue?.entryId,
      ),
    )
    .map((contest) => contest.key);

  return {
    categoryId,
    title: [category.ageClassName, category.label].filter((part) => part !== null).join(' · '),
    format: category.format,
    isReady,
    runningKeys,
    athletes,
    finished,
    contests,
    places,
  };
}

/**
 * Finds the two athletes of the match that finished last, who need a rest.
 * @returns their entry ids, or none if no match has finished yet
 */
export async function getLastFinishedPair(
  db: SQLiteDatabase,
  tournamentId: string,
): Promise<string[]> {
  const row = await db.getFirstAsync<{ whiteEntryId: string; blueEntryId: string }>(
    `SELECT matches.whiteEntryId, matches.blueEntryId
     FROM matches
     JOIN categories ON categories.id = matches.categoryId
     WHERE categories.tournamentId = ? AND matches.status = 'finished'
       AND matches.finishedAtMs IS NOT NULL
     ORDER BY matches.finishedAtMs DESC
     LIMIT 1`,
    [tournamentId],
  );

  return row === null ? [] : [row.whiteEntryId, row.blueEntryId];
}

/**
 * Reads the contests of every category with a locked draw, youngest age class first.
 * @param tournamentId the tournament to read
 * @returns the categories that have contests
 */
export async function listTournamentContests(
  db: SQLiteDatabase,
  tournamentId: string,
): Promise<CategoryContests[]> {
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT categories.id FROM categories
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     WHERE categories.tournamentId = ?
     ORDER BY age_classes.sortOrder IS NULL, age_classes.sortOrder, categories.sex,
       categories.maxKg IS NULL, categories.maxKg, categories.label`,
    [tournamentId],
  );
  const categories: CategoryContests[] = [];

  for (const row of rows) {
    const category = await getCategoryContests(db, row.id);
    if (category !== null && category.contests.length > 0) {
      categories.push(category);
    }
  }

  return categories;
}
