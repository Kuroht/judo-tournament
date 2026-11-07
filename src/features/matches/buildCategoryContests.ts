/**
 * =====================================================
 * FILE: buildCategoryContests.ts
 * PURPOSE: Lists a category's contests from its draw and
 *          finished matches. Nothing about the bracket is
 *          saved: it's worked out from the results each time,
 *          so that correcting a result can't leave it wrong.
 * USED BY: contestQueries.ts
 * =====================================================
 */
import type { CategoryFormat } from '@/features/categories';
import { splitIntoTwoPoules } from '@/lib/brackets/pouleSchedule';
import {
  resolveBracketWithPlaces,
  type BracketMatch,
  type BracketResult,
  type BracketResults,
} from '@/lib/brackets/resolveBracket';
import { getTwoPoulesFinals } from '@/lib/brackets/twoPoulesFinals';

import { buildPouleContests, type PouleTools } from './buildPouleContests';
import { fromBracketPlaces, fromPouleOrder, getTwoPoulesPlaces } from './categoryPlaces';
import type { Contest, ContestAthlete, ContestPlace, FinishedMatch } from './types';

// A single poule gives medals to its top three. Two poules send their top two onward.
const PLACES_NEEDED_IN_ONE_POULE = 3;
const PLACES_NEEDED_IN_TWO_POULES = 2;

/** Turns finished matches into the results the bracket works from. */
function toBracketResults(
  finished: readonly FinishedMatch[],
  positionOf: (entryId: string) => number,
): BracketResults {
  const results: Record<string, BracketResult> = {};

  for (const match of finished) {
    let winner: BracketResult['winner'] = 'none';
    if (match.winnerEntryId !== null) {
      winner = match.winnerEntryId === match.whiteEntryId ? 'white' : 'blue';
    }

    results[match.matchKey] = {
      white: positionOf(match.whiteEntryId),
      blue: positionOf(match.blueEntryId),
      winner,
      // FPJ Article 43.2: a no-show can't be repechaged.
      isLoserOut: match.resultType === 'fusenGachi',
    };
  }

  return results;
}

/**
 * Lists every contest known so far in a category.
 * @param format the category's format
 * @param athletes the athletes in the draw
 * @param finished the finished matches
 * @returns the contests, in the order they should be fought
 */
export function buildCategoryContests(
  format: CategoryFormat,
  athletes: readonly ContestAthlete[],
  finished: readonly FinishedMatch[],
): Contest[] {
  return resolveCategory(format, athletes, finished).contests;
}

/**
 * Does the same as buildCategoryContests, and also says who has finished where.
 * @returns the contests, and the places known so far
 */
export function resolveCategory(
  format: CategoryFormat,
  athletes: readonly ContestAthlete[],
  finished: readonly FinishedMatch[],
): { contests: Contest[]; places: ContestPlace[] } {
  const byPosition = new Map(athletes.map((athlete) => [athlete.position, athlete]));
  const athleteAt = (position: number) => byPosition.get(position) ?? null;
  const positionOf = (entryId: string) =>
    athletes.find((athlete) => athlete.entryId === entryId)?.position ?? 0;
  const results = toBracketResults(finished, positionOf);

  /** A finished match only counts if these same two athletes fought it. */
  function findFinishedFor(key: string, white: ContestAthlete | null, blue: ContestAthlete | null) {
    const match = finished.find((other) => other.matchKey === key);
    const isSamePair =
      match?.whiteEntryId === white?.entryId && match?.blueEntryId === blue?.entryId;

    return isSamePair ? match : undefined;
  }

  function toContest(
    key: string,
    part: Contest['part'],
    pouleName: Contest['pouleName'],
    white: ContestAthlete | null,
    blue: ContestAthlete | null,
    isPlayoff: boolean,
  ): Contest {
    const match = findFinishedFor(key, white, blue);

    return {
      key,
      part,
      pouleName,
      isPlayoff,
      white,
      blue,
      isFinished: match !== undefined,
      winnerEntryId: match?.winnerEntryId ?? null,
      resultType: match?.resultType ?? null,
    };
  }

  function fromBracketMatch(match: BracketMatch): Contest {
    const white = match.white === null ? null : athleteAt(match.white);
    const blue = match.blue === null ? null : athleteAt(match.blue);

    return toContest(match.key, match.part, null, white, blue, false);
  }

  if (format !== 'poule' && format !== 'twoPoules') {
    const bracket = resolveBracketWithPlaces(athletes.length, format, results);

    return {
      contests: bracket.matches.map(fromBracketMatch),
      places: fromBracketPlaces(bracket.places),
    };
  }

  /** Builds the tools for one poule. A poule is named A or B only if there are two. */
  function toolsFor(pouleName: Contest['pouleName']): PouleTools {
    return {
      athleteAt,
      makeContest: (key, white, blue, isPlayoff) =>
        toContest(key, 'poule', pouleName, white, blue, isPlayoff),
      findFinished: (contest) => findFinishedFor(contest.key, contest.white, contest.blue),
    };
  }

  const positions = athletes.map((athlete) => athlete.position).sort((a, b) => a - b);

  if (format === 'poule') {
    const poule = buildPouleContests(
      positions,
      'poule-A',
      false,
      PLACES_NEEDED_IN_ONE_POULE,
      toolsFor(null),
    );

    return { contests: poule.contests, places: fromPouleOrder(poule.order, poule.tiedGroups) };
  }

  const [membersA, membersB] = splitIntoTwoPoules(positions);
  const pouleA = buildPouleContests(
    membersA,
    'poule-A',
    false,
    PLACES_NEEDED_IN_TWO_POULES,
    toolsFor('A'),
  );
  const pouleB = buildPouleContests(
    membersB,
    'poule-B',
    false,
    PLACES_NEEDED_IN_TWO_POULES,
    toolsFor('B'),
  );
  // Once a poule is decided, a missing place means withdrawals left nobody to fill it.
  const placeIn = (order: readonly number[] | null, index: number): number | 'nobody' | null => {
    if (order === null) {
      return null;
    }

    return index < order.length ? (order[index] ?? null) : 'nobody';
  };
  const firstOfA = placeIn(pouleA.order, 0);
  const secondOfA = placeIn(pouleA.order, 1);
  const firstOfB = placeIn(pouleB.order, 0);
  const secondOfB = placeIn(pouleB.order, 1);
  const finals = getTwoPoulesFinals([firstOfA, secondOfA], [firstOfB, secondOfB], results).map(
    fromBracketMatch,
  );
  // With nobody to fight in a semifinal, the other athlete goes straight to the final.
  const byeFinalists = [
    secondOfB === 'nobody' ? firstOfA : null,
    secondOfA === 'nobody' ? firstOfB : null,
  ].filter((athlete) => typeof athlete === 'number');

  return {
    contests: [...pouleA.contests, ...pouleB.contests, ...finals],
    places: getTwoPoulesPlaces(finals, byeFinalists),
  };
}

/**
 * Counts the finished matches that depend on one match, because removing its result
 * makes them stop counting. Used to warn before a result is corrected.
 * @param matchKey the match being corrected
 * @returns how many other finished matches depend on it
 */
export function countDependentMatches(
  format: CategoryFormat,
  athletes: readonly ContestAthlete[],
  finished: readonly FinishedMatch[],
  matchKey: string,
): number {
  const without = finished.filter((match) => match.matchKey !== matchKey);
  const stillFinished = buildCategoryContests(format, athletes, without)
    .filter((contest) => contest.isFinished)
    .map((contest) => contest.key);

  return buildCategoryContests(format, athletes, finished).filter(
    (contest) =>
      contest.isFinished && contest.key !== matchKey && !stillFinished.includes(contest.key),
  ).length;
}
