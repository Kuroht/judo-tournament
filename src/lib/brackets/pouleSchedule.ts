/**
 * =====================================================
 * FILE: pouleSchedule.ts
 * PURPOSE: Who fights whom in a poule, and in what order.
 * USED BY: PoulePreview.tsx, and the match list from step 11
 * =====================================================
 */

/** Two positions within a poule, numbered from 1. */
export type PoulePairing = readonly [number, number];

// FPJ Article 40.6 sets the order for 3, 4 and 5 athletes.
const FPJ_SCHEDULES: Readonly<Record<number, readonly PoulePairing[]>> = {
  // FPJ Article 38.2: two athletes fight the best of three.
  2: [
    [1, 2],
    [1, 2],
    [1, 2],
  ],
  3: [
    [1, 2],
    [2, 3],
    [1, 3],
  ],
  4: [
    [1, 2],
    [3, 4],
    [1, 3],
    [2, 4],
    [1, 4],
    [2, 3],
  ],
  5: [
    [4, 5],
    [1, 2],
    [3, 4],
    [1, 5],
    [2, 3],
    [1, 4],
    [3, 5],
    [2, 4],
    [1, 3],
    [2, 5],
  ],
};

/**
 * Lists a poule's matches. Sizes the FPJ doesn't cover use the round-robin method:
 * everyone sits in a circle, and all but the first move one seat each round, so that
 * everyone meets everyone exactly once.
 * @param athleteCount how many athletes are in the poule
 * @returns the pairs, in order
 * @example
 * getPouleSchedule(3); // [[1, 2], [2, 3], [1, 3]]
 */
export function getPouleSchedule(athleteCount: number): readonly PoulePairing[] {
  const fpjSchedule = FPJ_SCHEDULES[athleteCount];
  if (fpjSchedule !== undefined) {
    return fpjSchedule;
  }

  // 1. An odd number gets an empty seat (0), and whoever faces it rests that round.
  const seats = Array.from({ length: athleteCount }, (_, index) => index + 1);
  if (athleteCount % 2 === 1) {
    seats.push(0);
  }

  const pairings: PoulePairing[] = [];
  for (let round = 0; round < seats.length - 1; round += 1) {
    for (let index = 0; index < seats.length / 2; index += 1) {
      const first = seats[index] ?? 0;
      const second = seats[seats.length - 1 - index] ?? 0;
      if (first !== 0 && second !== 0) {
        pairings.push(first < second ? [first, second] : [second, first]);
      }
    }

    // 2. Keep the first seat still, and move everyone else along by one.
    const last = seats.pop() ?? 0;
    seats.splice(1, 0, last);
  }

  return pairings;
}

/**
 * Moves matches between clubmates to the front (FPJ Article 40.5). Otherwise the order
 * stays the same.
 * @param schedule the poule's matches
 * @param clubOf gives the club of a position in the poule, or null if none
 * @returns the matches in the order they should be fought
 */
export function putSameClubMatchesFirst(
  schedule: readonly PoulePairing[],
  clubOf: (position: number) => string | null,
): PoulePairing[] {
  const isSameClub = ([first, second]: PoulePairing) => {
    const club = clubOf(first);

    return club !== null && club === clubOf(second);
  };

  return [...schedule.filter(isSameClub), ...schedule.filter((pair) => !isSameClub(pair))];
}

/**
 * Checks if a best-of-three is already over, because someone has won twice.
 * @param wins how many matches each athlete has won
 * @example
 * isBestOfThreeOver([2, 0]); // true
 */
export function isBestOfThreeOver(wins: readonly [number, number]): boolean {
  return wins[0] >= 2 || wins[1] >= 2;
}

/**
 * Splits a category into two poules (FPJ Article 38). Alternating keeps the sizes even,
 * and it sends seeds 1 and 2 to different poules.
 * @param positions the draw positions
 * @returns the positions in poule A and in poule B
 * @example
 * splitIntoTwoPoules([1, 2, 3, 4, 5, 6, 7]); // [[1, 3, 5, 7], [2, 4, 6]]
 */
export function splitIntoTwoPoules(positions: readonly number[]): [number[], number[]] {
  const sorted = [...positions].sort((a, b) => a - b);

  return [
    sorted.filter((_, index) => index % 2 === 0),
    sorted.filter((_, index) => index % 2 === 1),
  ];
}
