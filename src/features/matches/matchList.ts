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

/** The two athletes of the match that finished last, who need a rest. */
export type LastPair = readonly string[];

function isInPair(item: MatchListItem, pair: LastPair): boolean {
  const { white, blue } = item.contest;

  return pair.includes(white?.entryId ?? '') || pair.includes(blue?.entryId ?? '');
}

/**
 * Finds the match to fight next. A match already running comes first, because it has to
 * end before another begins. Otherwise each category's own next match is a candidate,
 * so that a category's order is never broken (FPJ Article 40). The first candidate whose
 * athletes didn't just fight is chosen, so nobody fights twice in a row when another
 * category has a match ready.
 * @param items the matches, in category order
 * @param lastPair the athletes of the match that finished last
 * @returns the match, or null if none is ready
 */
export function findNextMatch(
  items: readonly MatchListItem[],
  lastPair: LastPair = [],
): MatchListItem | null {
  const running = items.find((item) => item.status === 'running');
  if (running !== undefined) {
    return running;
  }

  const candidates: MatchListItem[] = [];
  for (const item of items) {
    const isFirstOfItsCategory = !candidates.some(
      (candidate) => candidate.categoryId === item.categoryId,
    );
    const isNotFinished = item.status === 'pending' || item.status === 'waiting';
    // A category's first unfinished match blocks the rest of it, even while it waits.
    if (isNotFinished && isFirstOfItsCategory) {
      candidates.push(item);
    }
  }

  const ready = candidates.filter((item) => item.status === 'pending');

  return ready.find((item) => !isInPair(item, lastPair)) ?? ready[0] ?? null;
}

/**
 * Plans the next few matches, as if each one is fought in turn.
 * @param items the matches, in category order
 * @param lastPair the athletes of the match that finished last
 * @param count how many to plan
 * @param skipId a match to leave out, such as the one being fought now
 */
export function planUpcomingMatches(
  items: readonly MatchListItem[],
  lastPair: LastPair,
  count: number,
  skipId: string | null = null,
): MatchListItem[] {
  const planned: MatchListItem[] = [];
  let remaining = items.filter((item) => item.id !== skipId);
  let pair = lastPair;

  for (let index = 0; index < count; index += 1) {
    const next = findNextMatch(remaining, pair);
    if (next === null) {
      break;
    }

    planned.push(next);
    pair = [next.contest.white?.entryId ?? '', next.contest.blue?.entryId ?? ''];
    // Planned matches count as fought, so the next in that category becomes a candidate.
    remaining = remaining
      .filter((item) => item.id !== next.id)
      .map((item) => (item.status === 'running' ? { ...item, status: 'pending' } : item));
  }

  return planned;
}

/** A line in the list: a category's heading, or one of its matches. */
export type MatchListLine =
  | { type: 'heading'; id: string; title: string }
  | { type: 'match'; id: string; item: MatchListItem };

/**
 * Puts a heading above each category's matches, so names don't repeat on every row.
 * @param items the matches, already in category order
 */
export function addCategoryHeadings(items: readonly MatchListItem[]): MatchListLine[] {
  const lines: MatchListLine[] = [];
  let currentCategoryId: string | null = null;

  for (const item of items) {
    if (item.categoryId !== currentCategoryId) {
      currentCategoryId = item.categoryId;
      lines.push({ type: 'heading', id: `heading-${item.categoryId}`, title: item.category.title });
    }
    lines.push({ type: 'match', id: item.id, item });
  }

  return lines;
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
