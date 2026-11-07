/**
 * =====================================================
 * FILE: buildPouleContests.ts
 * PURPOSE: Lists one poule's contests, including the new
 *          contests that FPJ Article 47.2 requires when every
 *          tie-break has failed.
 * USED BY: buildCategoryContests.ts
 * =====================================================
 */
import {
  getPouleSchedule,
  isBestOfThreeOver,
  putSameClubMatchesFirst,
} from '@/lib/brackets/pouleSchedule';
import { rankPoule, type PouleResult } from '@/lib/brackets/rankPoule';

import type { Contest, ContestAthlete, FinishedMatch } from './types';

/** What a poule needs from the category it belongs to. */
export type PouleTools = {
  athleteAt: (position: number) => ContestAthlete | null;
  makeContest: (
    key: string,
    white: ContestAthlete | null,
    blue: ContestAthlete | null,
    isPlayoff: boolean,
  ) => Contest;
  findFinished: (contest: Contest) => FinishedMatch | undefined;
};

type PouleOutcome = {
  contests: Contest[];
  // The positions, best first. Null until the poule and its ties have been decided.
  order: number[] | null;
};

/** Turns a finished match into a result for the ranking, using draw positions. */
function toPouleResult(match: FinishedMatch, white: number, blue: number): PouleResult {
  let winner: PouleResult['winner'] = 'none';
  if (match.winnerEntryId !== null) {
    winner = match.winnerEntryId === match.whiteEntryId ? 'white' : 'blue';
  }

  return {
    white,
    blue,
    winner,
    resultType: match.resultType,
    durationSeconds: match.durationSeconds,
  };
}

/**
 * Lists the contests of a poule, or of a tie being fought again.
 * @param positions the draw positions taking part
 * @param keyPrefix the start of each contest's key
 * @param isPlayoff true when these athletes are repeating their matches after a tie
 * @param placesNeeded a tie below this place decides nothing, so it isn't fought again
 * @param tools what is needed from the category
 * @returns the contests, and the final order once it's known
 */
export function buildPouleContests(
  positions: readonly number[],
  keyPrefix: string,
  isPlayoff: boolean,
  placesNeeded: number,
  tools: PouleTools,
): PouleOutcome {
  const { athleteAt, makeContest, findFinished } = tools;
  const isBestOfThree = positions.length === 2 && !isPlayoff;
  // Two tied athletes fight once, because a best of three only applies to a whole poule.
  const fullSchedule = getPouleSchedule(positions.length);
  const schedule = positions.length === 2 && isPlayoff ? fullSchedule.slice(0, 1) : fullSchedule;
  const pairs = putSameClubMatchesFirst(
    schedule,
    (number) => athleteAt(positions[number - 1] ?? 0)?.clubId ?? null,
  );

  const contests: Contest[] = [];
  const results: PouleResult[] = [];
  const wins = new Map<number, number>();
  let isComplete = true;

  pairs.forEach(([first, second], index) => {
    const white = positions[first - 1] ?? 0;
    const blue = positions[second - 1] ?? 0;
    const bestOfThreeWins: [number, number] = [wins.get(white) ?? 0, wins.get(blue) ?? 0];

    // FPJ Article 38.2: a best of three stops as soon as someone has won twice. So
    // each match is only listed once the one before it has finished.
    if (isBestOfThree && (isBestOfThreeOver(bestOfThreeWins) || !isComplete)) {
      return;
    }

    const contest = makeContest(
      `${keyPrefix}-${index + 1}`,
      athleteAt(white),
      athleteAt(blue),
      isPlayoff,
    );
    const match = findFinished(contest);
    contests.push(contest);

    if (match === undefined) {
      isComplete = false;
      return;
    }

    const result = toPouleResult(match, white, blue);
    results.push(result);
    if (result.winner !== 'none') {
      const winner = result.winner === 'white' ? white : blue;
      wins.set(winner, (wins.get(winner) ?? 0) + 1);
    }
  });

  if (!isComplete) {
    return { contests, order: null };
  }

  const athletes = positions.map((position) => ({
    position,
    weighedKg: athleteAt(position)?.weighedKg ?? null,
  }));
  const standings = rankPoule(athletes, results, true);
  const places = [...new Set(standings.map((standing) => standing.place))];
  const order: number[] = [];
  let isDecided = true;

  for (const place of places) {
    const tied = standings
      .filter((standing) => standing.place === place)
      .map((standing) => standing.position);

    if (tied.length === 1 || place > placesNeeded) {
      order.push(...tied);
      continue;
    }

    const tiedInOrder = [...tied].sort((a, b) => a - b);
    const playoff = buildPouleContests(
      tiedInOrder,
      // The athletes are part of the key, so a different tie after a correction starts
      // afresh instead of reusing a result from the old tie.
      `${keyPrefix}-tie${place}-${tiedInOrder.join('_')}`,
      true,
      // In a tie for 2nd when only two go on, just the winner matters.
      Math.min(tied.length, placesNeeded - place + 1),
      tools,
    );
    contests.push(...playoff.contests);
    if (playoff.order === null) {
      isDecided = false;
    } else {
      order.push(...playoff.order);
    }
  }

  return { contests, order: isDecided ? order : null };
}
