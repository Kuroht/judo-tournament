/**
 * =====================================================
 * FILE: rankPoule.ts
 * PURPOSE: Ranks a poule, following FPJ Articles 41, 43,
 *          44 and 47.
 * USED BY: buildPouleContests.ts
 * =====================================================
 */
import type { ResultType } from '@/lib/rules/types';

export type PouleResult = {
  white: number;
  blue: number;
  // 'none' means both athletes lost, such as a double hansoku-make.
  winner: 'white' | 'blue' | 'none';
  resultType: ResultType | null;
  durationSeconds: number;
};

export type PouleAthlete = {
  position: number;
  weighedKg: number | null;
};

export type PouleStanding = {
  position: number;
  wins: number;
  points: number;
  winSeconds: number;
  // Tied athletes who need a new contest share a place.
  place: number;
  // FPJ Article 47.2: every tie-break failed, so they fight again in golden score.
  needsPlayoff: boolean;
  // FPJ Articles 43.3 and 44: withdrew, so their matches don't count and they rank last.
  isOut: boolean;
};

/**
 * Finds the points a win is worth (FPJ Article 41).
 * The FPJ doesn't list a win by hansoku-make or withdrawal. We count them as 100, the
 * same as a no-show (Article 43.1). This is still to be validated by the trainer.
 * @param resultType how the match was won
 * @returns the points
 */
export function pointsForWin(resultType: ResultType | null): number {
  switch (resultType) {
    case 'ippon':
    case 'wazaAriAwasete':
    case 'hansokuMake':
    case 'kikenGachi':
    case 'fusenGachi':
      return 100;
    case 'wazaAri':
      return 10;
    case 'yuko':
      return 1;
    case 'decision':
      return 0.5;
    case null:
      return 0;
  }
}

/** Splits a tied group by a score, best first. Equal scores stay tied. */
function splitByScore(group: PouleStanding[], score: (athlete: PouleStanding) => number) {
  const scores = [...new Set(group.map(score))].sort((a, b) => b - a);

  return scores.map((value) => group.filter((athlete) => score(athlete) === value));
}

/**
 * Ranks a poule. Each tie-break only applies to athletes the earlier ones left tied.
 * @param athletes the poule's athletes
 * @param results the finished matches
 * @param isFinished true once every match has been fought. Before that, standings are
 *                   only provisional, and a tie doesn't mean that a playoff is needed.
 * @param outPositions athletes whose matches are annulled because they withdrew. Whoever
 *                     calls this must apply FPJ Article 44's exception: an injury in the
 *                     athlete's last match doesn't annul their results.
 * @returns the standings, best first
 */
export function rankPoule(
  athletes: readonly PouleAthlete[],
  results: readonly PouleResult[],
  isFinished: boolean,
  outPositions: readonly number[] = [],
): PouleStanding[] {
  const counted = results.filter(
    (result) => !outPositions.includes(result.white) && !outPositions.includes(result.blue),
  );
  const winnerOf = (result: PouleResult) => {
    if (result.winner === 'none') {
      return null;
    }

    return result.winner === 'white' ? result.white : result.blue;
  };

  const standings: PouleStanding[] = athletes.map(({ position }) => {
    const won = counted.filter((result) => winnerOf(result) === position);

    return {
      position,
      wins: won.length,
      // Only the winner scores, as in FPJ Article 41. IJF also counts the loser's scores.
      points: won.reduce((total, result) => total + pointsForWin(result.resultType), 0),
      winSeconds: won.reduce((total, result) => total + result.durationSeconds, 0),
      place: 0,
      needsPlayoff: false,
      isOut: outPositions.includes(position),
    };
  });

  const weightOf = (position: number) =>
    athletes.find((athlete) => athlete.position === position)?.weighedKg ?? null;

  /** Counts wins against only the others in the same tied group. */
  const headToHead = (group: PouleStanding[]) => (athlete: PouleStanding) => {
    const inGroup = group.map((other) => other.position);

    return counted.filter(
      (result) =>
        winnerOf(result) === athlete.position &&
        inGroup.includes(result.white) &&
        inGroup.includes(result.blue),
    ).length;
  };

  // FPJ Article 47.1, in order. Scores are "higher is better", so time and weight are negative.
  const tieBreaks: ((group: PouleStanding[]) => (athlete: PouleStanding) => number)[] = [
    () => (athlete) => athlete.wins,
    () => (athlete) => athlete.points,
    headToHead,
    () => (athlete) => -athlete.winSeconds,
    // An athlete with no recorded weight can't win this tie-break.
    () => (athlete) => -(weightOf(athlete.position) ?? Infinity),
  ];

  let groups = [standings.filter((athlete) => !athlete.isOut)];
  for (const tieBreak of tieBreaks) {
    groups = groups.flatMap((group) =>
      group.length > 1 ? splitByScore(group, tieBreak(group)) : [group],
    );
  }

  const ranked: PouleStanding[] = [];
  for (const group of groups) {
    for (const athlete of group) {
      ranked.push({
        ...athlete,
        place: ranked.length + 1 - group.indexOf(athlete),
        needsPlayoff: isFinished && group.length > 1,
      });
    }
  }

  const out = standings
    .filter((athlete) => athlete.isOut)
    .map((athlete, index) => ({ ...athlete, place: ranked.length + 1 + index }));

  return [...ranked, ...out];
}
