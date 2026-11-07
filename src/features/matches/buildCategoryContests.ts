/**
 * =====================================================
 * FILE: buildCategoryContests.ts
 * PURPOSE: Lists a category's contests from its draw and
 *          finished matches. A pure function, so it's easy
 *          to test.
 * USED BY: matchQueries.ts
 * =====================================================
 */
import type { CategoryFormat } from '@/features/categories';
import {
  getPouleSchedule,
  isBestOfThreeOver,
  putSameClubMatchesFirst,
  splitIntoTwoPoules,
} from '@/lib/brackets/pouleSchedule';
import { rankPoule, type PouleResult } from '@/lib/brackets/rankPoule';
import {
  resolveBracket,
  type BracketMatch,
  type BracketResult,
  type BracketResults,
} from '@/lib/brackets/resolveBracket';
import { getTwoPoulesFinals } from '@/lib/brackets/twoPoulesFinals';

import type { Contest, ContestAthlete, FinishedMatch } from './types';

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
  const byPosition = new Map(athletes.map((athlete) => [athlete.position, athlete]));
  const positionOf = (entryId: string) =>
    athletes.find((athlete) => athlete.entryId === entryId)?.position ?? 0;
  const results = toBracketResults(finished, positionOf);

  /** A finished match only counts if these same two athletes fought it. */
  function findFinished(key: string, white: ContestAthlete | null, blue: ContestAthlete | null) {
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
  ): Contest {
    const match = findFinished(key, white, blue);

    return {
      key,
      part,
      pouleName,
      white,
      blue,
      isFinished: match !== undefined,
      winnerEntryId: match?.winnerEntryId ?? null,
    };
  }

  function fromBracketMatch(match: BracketMatch): Contest {
    const white = match.white === null ? null : (byPosition.get(match.white) ?? null);
    const blue = match.blue === null ? null : (byPosition.get(match.blue) ?? null);

    return toContest(match.key, match.part, null, white, blue);
  }

  if (format !== 'poule' && format !== 'twoPoules') {
    return resolveBracket(athletes.length, format, results).map(fromBracketMatch);
  }

  // ---------------------------------------------
  // SECTION: Poules
  // ---------------------------------------------

  const positions = athletes.map((athlete) => athlete.position);
  const poules =
    format === 'twoPoules'
      ? (splitIntoTwoPoules(positions).map((members, index) => ({
          members,
          name: index === 0 ? 'A' : 'B',
        })) as { members: number[]; name: 'A' | 'B' | null }[])
      : [{ members: [...positions].sort((a, b) => a - b), name: null }];

  const contests: Contest[] = [];
  const topTwo: [number | null, number | null][] = [];

  for (const { members, name } of poules) {
    const memberAt = (number: number) => byPosition.get(members[number - 1] ?? 0) ?? null;
    const schedule = putSameClubMatchesFirst(
      getPouleSchedule(members.length),
      (number) => memberAt(number)?.clubId ?? null,
    );
    const pouleResults: PouleResult[] = [];
    let isComplete = true;
    const wins: [number, number] = [0, 0];

    schedule.forEach(([first, second], index) => {
      // FPJ Article 38.2: a best of three stops as soon as someone has won twice. So
      // each match is only listed once the one before it has finished.
      if (members.length === 2 && (isBestOfThreeOver(wins) || !isComplete)) {
        return;
      }

      const key = `poule-${name ?? 'A'}-${index + 1}`;
      const contest = toContest(key, 'poule', name, memberAt(first), memberAt(second));
      const match = findFinished(key, contest.white, contest.blue);
      contests.push(contest);

      if (match === undefined) {
        isComplete = false;
        return;
      }

      let winner: PouleResult['winner'] = 'none';
      if (match.winnerEntryId !== null) {
        winner = match.winnerEntryId === match.whiteEntryId ? 'white' : 'blue';
      }
      if (winner === 'white') {
        wins[0] += 1;
      }
      if (winner === 'blue') {
        wins[1] += 1;
      }

      pouleResults.push({
        white: first,
        blue: second,
        winner,
        resultType: match.resultType,
        durationSeconds: match.durationSeconds,
      });
    });

    if (format === 'twoPoules') {
      const standings = rankPoule(
        members.map((_, index) => ({
          position: index + 1,
          weighedKg: memberAt(index + 1)?.weighedKg ?? null,
        })),
        pouleResults,
        isComplete,
      );
      // A tie that needs a new contest leaves the finalists unknown for now.
      const isDecided = isComplete && !standings.slice(0, 2).some((other) => other.needsPlayoff);
      const realPosition = (index: number) =>
        members[(standings[index]?.position ?? 0) - 1] ?? null;
      topTwo.push(isDecided ? [realPosition(0), realPosition(1)] : [null, null]);
    }
  }

  if (format === 'twoPoules') {
    const finals = getTwoPoulesFinals(topTwo[0] ?? [null, null], topTwo[1] ?? [null, null], results);
    contests.push(...finals.map(fromBracketMatch));
  }

  return contests;
}
