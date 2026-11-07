/**
 * =====================================================
 * FILE: buildResults.ts
 * PURPOSE: Turns each category's contests into results, the
 *          medal table and athlete history. Pure functions,
 *          so they're easy to test.
 * USED BY: useTournamentResults.ts, historyQueries.ts
 * =====================================================
 */
import type { CategoryContests } from '@/features/matches';

import type { CategoryResult, HistoryMatch, MedalRow, PlacedAthlete } from './types';

/** Turns a category's places into athletes, best first. */
function toPlacedAthletes(category: CategoryContests): PlacedAthlete[] {
  const placed: PlacedAthlete[] = [];

  for (const { position, place } of category.places) {
    const athlete = category.athletes.find((other) => other.position === position);
    if (athlete !== undefined) {
      placed.push({ place, athlete });
    }
  }

  return placed.sort((first, second) => first.place - second.place);
}

/** Works out how a category stands. */
export function toCategoryResult(category: CategoryContests): CategoryResult {
  const finishedCount = category.contests.filter((contest) => contest.isFinished).length;
  const totalCount = category.contests.length;

  return {
    categoryId: category.categoryId,
    title: category.title,
    isComplete: totalCount > 0 && finishedCount === totalCount,
    finishedCount,
    totalCount,
    placed: toPlacedAthletes(category),
  };
}

/**
 * Counts each club's medals, best first. Only finished categories count, because the
 * places in the others can still change. 1st is gold, 2nd is silver, and 3rd is bronze.
 * @param results the tournament's categories
 * @returns one line per club with a medal, with ties in name order
 */
export function buildMedalTable(results: readonly CategoryResult[]): MedalRow[] {
  const rows = new Map<string | null, MedalRow>();

  for (const result of results.filter((category) => category.isComplete)) {
    for (const { place, athlete } of result.placed.filter((other) => other.place <= 3)) {
      const row = rows.get(athlete.clubId) ?? {
        clubId: athlete.clubId,
        clubName: athlete.clubName,
        gold: 0,
        silver: 0,
        bronze: 0,
      };

      rows.set(athlete.clubId, {
        ...row,
        gold: row.gold + (place === 1 ? 1 : 0),
        silver: row.silver + (place === 2 ? 1 : 0),
        bronze: row.bronze + (place === 3 ? 1 : 0),
      });
    }
  }

  return [...rows.values()].sort(
    (first, second) =>
      second.gold - first.gold ||
      second.silver - first.silver ||
      second.bronze - first.bronze ||
      (first.clubName ?? '').localeCompare(second.clubName ?? '', 'pt'),
  );
}

/**
 * Lists one athlete's finished matches in a category.
 * @param category the category
 * @param entryId the athlete's entry in that category
 */
export function toHistoryMatches(category: CategoryContests, entryId: string): HistoryMatch[] {
  const matches: HistoryMatch[] = [];

  for (const contest of category.contests) {
    const isWhite = contest.white?.entryId === entryId;
    const isBlue = contest.blue?.entryId === entryId;

    if (contest.isFinished && (isWhite || isBlue)) {
      matches.push({
        key: contest.key,
        opponentName: (isWhite ? contest.blue?.name : contest.white?.name) ?? '',
        didWin: contest.winnerEntryId === entryId,
        resultType: contest.resultType,
      });
    }
  }

  return matches;
}

/**
 * Finds the place an athlete took in a category.
 * @returns the place, or null if the category hasn't finished or they took no place
 */
export function findPlace(category: CategoryContests, entryId: string): number | null {
  const result = toCategoryResult(category);
  const placed = result.placed.find((other) => other.athlete.entryId === entryId);

  return result.isComplete ? (placed?.place ?? null) : null;
}
