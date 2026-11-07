/**
 * =====================================================
 * FILE: matchList.ts
 * PURPOSE: Turns each category's contests into the
 *          tournament's match list. Pure functions, so
 *          they're easy to test.
 * USED BY: useTournamentMatches.ts, ContestRow.tsx,
 *          MatchListScreen.tsx
 * =====================================================
 */
import type { CategoryContests, Contest } from './types';

export type ContestStatus = 'waiting' | 'pending' | 'running' | 'finished';

export type MatchListFilter = 'toDo' | 'running' | 'finished' | 'all';

export type MatchListItem = {
  id: string;
  categoryId: string;
  category: CategoryContests;
  contest: Contest;
  status: ContestStatus;
};

/** Finds where a contest stands. */
export function getContestStatus(contest: Contest, isRunning: boolean): ContestStatus {
  if (contest.isFinished) {
    return 'finished';
  }
  if (contest.white === null || contest.blue === null) {
    return 'waiting';
  }

  return isRunning ? 'running' : 'pending';
}

/**
 * Lists every contest of a tournament, category by category.
 * @param categories the categories, in the order they should be fought
 */
export function buildMatchList(categories: readonly CategoryContests[]): MatchListItem[] {
  return categories.flatMap((category) =>
    category.contests.map((contest) => ({
      id: `${category.categoryId}:${contest.key}`,
      categoryId: category.categoryId,
      category,
      contest,
      status: getContestStatus(contest, category.runningKeys.includes(contest.key)),
    })),
  );
}

/**
 * Finds the match to fight next: the first that is ready. A match already running comes
 * first, because it has to end before another begins.
 * @returns the match, or null if none is ready
 */
export function findNextMatch(items: readonly MatchListItem[]): MatchListItem | null {
  return (
    items.find((item) => item.status === 'running') ??
    items.find((item) => item.status === 'pending') ??
    null
  );
}

/** Keeps the matches a filter asks for. */
export function filterMatchList(
  items: readonly MatchListItem[],
  filter: MatchListFilter,
): MatchListItem[] {
  switch (filter) {
    case 'all':
      return [...items];
    case 'toDo':
      return items.filter((item) => item.status === 'pending' || item.status === 'waiting');
    case 'running':
      return items.filter((item) => item.status === 'running');
    case 'finished':
      return items.filter((item) => item.status === 'finished');
  }
}
