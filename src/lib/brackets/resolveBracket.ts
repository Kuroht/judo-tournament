/**
 * =====================================================
 * FILE: resolveBracket.ts
 * PURPOSE: Works out an elimination bracket from the
 *          results so far, including who is repechaged.
 * USED BY: drawRules.ts (for its type), and the match
 *          list from step 11
 * =====================================================
 */
import { getBracketLayout, getBracketSize, getPoolAt, type PoolName } from './bracketLayout';

export type EliminationFormat = 'doubleRepechage' | 'quarterFinalRepechage' | 'directKnockout';

export type BracketPart = 'main' | 'semiFinal' | 'final' | 'repechage' | 'bronze';

/** The result of one match, and who it was between. */
export type BracketResult = {
  white: number;
  blue: number;
  // 'none' means both athletes lost, such as a double hansoku-make.
  winner: 'white' | 'blue' | 'none';
  // FPJ Article 43.2: a no-show can't be repechaged. Article 45.2 says the same of an
  // unsporting hansoku-make, but the match screen can't record that kind of hansoku-make yet.
  isLoserOut?: boolean;
};

export type BracketResults = Readonly<Record<string, BracketResult>>;

/** One contest. An athlete is their draw position, and null means not known yet. */
export type BracketMatch = {
  key: string;
  part: BracketPart;
  pool: PoolName | null;
  white: number | null;
  blue: number | null;
  winner: number | null;
};

// What can fill one side of a match: an athlete, nobody at all, or not known yet.
type Outcome = number | 'nobody' | 'pending';

type PoolMatch = { pool: PoolName; isQuarterFinal: boolean; winner: Outcome; loser: Outcome };

/** Who finished where, as draw positions. Places can be shared, as with two 3rds. */
export type BracketPlaces = {
  first: number[];
  second: number[];
  third: number[];
  fifth: number[];
};

function onlyAthletes(outcomes: readonly (number | string | null)[]): number[] {
  return outcomes.filter((outcome): outcome is number => typeof outcome === 'number');
}

/**
 * Works out every contest of a bracket from the results so far. If an earlier result
 * is edited, a later result between athletes who no longer meet is simply ignored,
 * and that match has to be fought again.
 * @param athleteCount how many athletes are in the draw
 * @param format which repechage to use
 * @param results the results so far, by match key
 * @returns the contests known so far. Byes and walkovers aren't contests, so they aren't
 *          listed. A pool's repechage only appears once its semifinalist is known,
 *          because until then nobody knows who is in it.
 */
export function resolveBracket(
  athleteCount: number,
  format: EliminationFormat,
  results: BracketResults,
): BracketMatch[] {
  return resolveBracketWithPlaces(athleteCount, format, results).matches;
}

/**
 * Does the same as resolveBracket, and also says who has finished where. A walkover isn't
 * a contest, so a medal won by one can only be found here, not in the list of matches.
 * @returns the contests, and the places known so far. They're only final when every
 *          contest has finished.
 */
export function resolveBracketWithPlaces(
  athleteCount: number,
  format: EliminationFormat,
  results: BracketResults,
): { matches: BracketMatch[]; places: BracketPlaces } {
  const matches: BracketMatch[] = [];
  const places: BracketPlaces = { first: [], second: [], third: [], fifth: [] };
  const poolMatches: PoolMatch[] = [];

  /** Plays one match if it can, and says who won and who lost. */
  function play(key: string, part: BracketPart, pool: PoolName | null, a: Outcome, b: Outcome) {
    // 1. If a side has nobody, the other goes through without a contest.
    if (a === 'nobody' || b === 'nobody') {
      return { winner: a === 'nobody' ? b : a, loser: 'nobody' as Outcome };
    }

    const white = a === 'pending' ? null : a;
    const blue = b === 'pending' ? null : b;
    const result = results[key];
    let winner: Outcome = 'pending';
    let loser: Outcome = 'pending';

    // 2. A result only counts for the two athletes who actually fought it.
    if (white !== null && blue !== null && result?.white === white && result.blue === blue) {
      if (result.winner === 'none') {
        winner = 'nobody';
        loser = 'nobody';
      } else {
        winner = result.winner === 'white' ? white : blue;
        loser = result.winner === 'white' ? blue : white;
        loser = result.isLoserOut ? 'nobody' : loser;
      }
    }

    matches.push({
      key,
      part,
      pool,
      white,
      blue,
      winner: typeof winner === 'number' ? winner : null,
    });

    return { winner, loser };
  }

  // ---------------------------------------------
  // SECTION: The main bracket
  // ---------------------------------------------

  const size = getBracketSize(athleteCount);
  let sheet: Outcome[] = getBracketLayout(size).map((position) =>
    position <= athleteCount ? position : 'nobody',
  );
  let semiFinalLosers: Outcome[] = [];
  let poolWinners: Outcome[] = [];
  let round = 1;

  while (sheet.length > 1) {
    const next: Outcome[] = [];
    const roundLosers: Outcome[] = [];

    if (sheet.length === 4) {
      poolWinners = sheet;
    }

    for (let index = 0; index < sheet.length; index += 2) {
      const white = sheet[index] ?? 'nobody';
      const blue = sheet[index + 1] ?? 'nobody';
      const key = `r${round}-${index / 2 + 1}`;
      let part: BracketPart = 'main';
      if (sheet.length === 4) {
        part = 'semiFinal';
      }
      if (sheet.length === 2) {
        part = 'final';
      }
      const pool = sheet.length > 4 ? getPoolAt(index, sheet.length) : null;
      const played = play(key, part, pool, white, blue);

      next.push(played.winner);
      roundLosers.push(played.loser);

      if (pool !== null) {
        poolMatches.push({
          pool,
          isQuarterFinal: sheet.length === 8,
          winner: played.winner,
          loser: played.loser,
        });
      }
    }

    if (sheet.length === 4) {
      semiFinalLosers = roundLosers;
    }

    sheet = next;
    round += 1;
  }

  /** Finds the athletes who both lost a contest of this kind (IJF Article 18.3.1). */
  function bothLostIn(part: BracketPart): number[] {
    const bothLost = matches.filter((match) => {
      const result = results[match.key];

      return (
        match.part === part &&
        result?.winner === 'none' &&
        result.white === match.white &&
        result.blue === match.blue
      );
    });

    return onlyAthletes(bothLost.flatMap((match) => [match.white, match.blue]));
  }

  // After the last round, only the winner of the final is left on the sheet.
  places.first.push(...onlyAthletes(sheet));
  const final = matches.find((match) => match.part === 'final');
  if (final !== undefined && final.winner !== null) {
    places.second.push(...onlyAthletes([final.winner === final.white ? final.blue : final.white]));
  }
  // FPJ Article 45.3: both losing a final makes them both 2nd. In a semifinal, both 5th.
  places.second.push(...bothLostIn('final'));
  places.fifth.push(...bothLostIn('semiFinal'));

  if (format === 'directKnockout') {
    // With no bronze contests, both semifinal losers finish 3rd.
    places.third.push(...onlyAthletes(semiFinalLosers));

    return { matches, places };
  }

  // ---------------------------------------------
  // SECTION: The repechage
  // ---------------------------------------------

  /** Runs one pool's repechage, and says who comes out of it. */
  function playPoolRepechage(pool: PoolName, semiFinalist: Outcome): Outcome {
    if (semiFinalist === 'pending') {
      return 'pending';
    }

    // 3. Only those who lost to this pool's semifinalist are repechaged, earliest first.
    const victims = poolMatches
      .filter((match) => match.pool === pool && match.winner === semiFinalist)
      .filter((match) => format === 'doubleRepechage' || match.isQuarterFinal)
      .map((match) => match.loser);

    let survivor: Outcome = 'nobody';
    victims.forEach((victim, index) => {
      survivor = play(`rep-${pool}-${index}`, 'repechage', pool, survivor, victim).winner;
    });

    return survivor;
  }

  const [poolA, poolB, poolC, poolD] = poolWinners;
  const fromA = playPoolRepechage('A', poolA ?? 'nobody');
  const fromB = playPoolRepechage('B', poolB ?? 'nobody');
  const fromC = playPoolRepechage('C', poolC ?? 'nobody');
  const fromD = playPoolRepechage('D', poolD ?? 'nobody');

  const tableOne = play('rep-table-1', 'repechage', null, fromA, fromB).winner;
  const tableTwo = play('rep-table-2', 'repechage', null, fromC, fromD).winner;

  // 4. Each side meets the semifinal loser from the opposite half of the sheet.
  const bronzeOne = play('bronze-1', 'bronze', null, tableOne, semiFinalLosers[1] ?? 'nobody');
  const bronzeTwo = play('bronze-2', 'bronze', null, tableTwo, semiFinalLosers[0] ?? 'nobody');

  places.third.push(...onlyAthletes([bronzeOne.winner, bronzeTwo.winner]));
  places.fifth.push(...onlyAthletes([bronzeOne.loser, bronzeTwo.loser]), ...bothLostIn('bronze'));

  return { matches, places };
}
