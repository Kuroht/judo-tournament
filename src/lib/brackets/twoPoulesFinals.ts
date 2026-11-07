/**
 * =====================================================
 * FILE: twoPoulesFinals.ts
 * PURPOSE: The contests after two poules (FPJ Article 38):
 *          two crossed semifinals and a final.
 * USED BY: the match list from step 11
 * =====================================================
 */
import type { BracketMatch, BracketResults } from './resolveBracket';

// What can fill one side: an athlete, nobody at all, or not known yet.
type Outcome = number | 'nobody' | 'pending';

/**
 * Works out the semifinals and final from the poule standings.
 * @param pouleA the first and second of poule A, or null while not known
 * @param pouleB the first and second of poule B, or null while not known
 * @param results the results so far, by match key
 * @returns the contests. Both semifinal losers finish 3rd, so there is no bronze contest.
 *          If both athletes lose a semifinal, the other semifinal's winner has no final
 *          to fight, so no final is listed.
 */
export function getTwoPoulesFinals(
  pouleA: readonly [number | null, number | null],
  pouleB: readonly [number | null, number | null],
  results: BracketResults,
): BracketMatch[] {
  const matches: BracketMatch[] = [];

  /** Plays one contest if it can, and says who came out of it. */
  function play(key: string, part: BracketMatch['part'], white: Outcome, blue: Outcome): Outcome {
    // If a side has nobody, the other goes through without a contest.
    if (white === 'nobody' || blue === 'nobody') {
      return white === 'nobody' ? blue : white;
    }

    const whiteAthlete = white === 'pending' ? null : white;
    const blueAthlete = blue === 'pending' ? null : blue;
    const result = results[key];
    let winner: Outcome = 'pending';

    // A result only counts for the two athletes who actually fought it.
    if (result?.white === whiteAthlete && result?.blue === blueAthlete) {
      if (result !== undefined) {
        winner = result.winner === 'none' ? 'nobody' : (result.winner === 'white' ? white : blue);
      }
    }

    matches.push({
      key,
      part,
      pool: null,
      white: whiteAthlete,
      blue: blueAthlete,
      winner: typeof winner === 'number' ? winner : null,
    });

    return winner;
  }

  const firstFinalist = play('cross-1', 'semiFinal', pouleA[0] ?? 'pending', pouleB[1] ?? 'pending');
  const secondFinalist = play('cross-2', 'semiFinal', pouleB[0] ?? 'pending', pouleA[1] ?? 'pending');
  play('final', 'final', firstFinalist, secondFinalist);

  return matches;
}
