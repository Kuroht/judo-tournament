/**
 * =====================================================
 * FILE: resolveBracket.test.ts
 * PURPOSE: Worked examples of the bracket, matching the
 *          plan in docs/regras-para-validar.md and the IJF
 *          diagrams on pages 220 to 222.
 * USED BY: npm test
 * =====================================================
 */
import { getBracketLayout, getBracketSize } from '../bracketLayout';
import {
  resolveBracket,
  type BracketMatch,
  type BracketResult,
  type BracketResults,
} from '../resolveBracket';

type Override = Partial<Pick<BracketResult, 'winner' | 'isLoserOut'>>;

/** Plays every available match. The lower position wins, unless an override says otherwise. */
function playFavourites(
  athleteCount: number,
  format: Parameters<typeof resolveBracket>[1] = 'doubleRepechage',
  overrides: Readonly<Record<string, Override>> = {},
) {
  const results: Record<string, BracketResult> = {};
  let matches: BracketMatch[] = [];

  // Each pass can unlock later matches, so repeat until nothing new can be played.
  for (let pass = 0; pass < 20; pass += 1) {
    matches = resolveBracket(athleteCount, format, results);
    for (const match of matches) {
      if (match.white !== null && match.blue !== null && results[match.key] === undefined) {
        const favourite = match.white < match.blue ? 'white' : 'blue';
        results[match.key] = {
          white: match.white,
          blue: match.blue,
          winner: favourite,
          ...overrides[match.key],
        };
      }
    }
  }

  return matches;
}

function pairs(matches: BracketMatch[], part: BracketMatch['part']) {
  return matches.filter((match) => match.part === part).map((match) => [match.white, match.blue]);
}

describe('the draw sheet', () => {
  it('chooses the smallest sheet that fits', () => {
    expect(getBracketSize(2)).toBe(8);
    expect(getBracketSize(8)).toBe(8);
    expect(getBracketSize(9)).toBe(16);
    expect(getBracketSize(17)).toBe(32);
  });

  it('places seeds as the IJF does: 1-8, 4-5, 2-7, 3-6', () => {
    expect(getBracketLayout(8)).toEqual([1, 8, 4, 5, 2, 7, 3, 6]);
  });

  it('pairs positions adding up to 17 on a 16 sheet', () => {
    expect(getBracketLayout(16)).toEqual([1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11]);
  });

  it.each([8, 16, 32, 64])('uses every position once on a %i sheet', (size) => {
    const layout = getBracketLayout(size);

    expect([...layout].sort((a, b) => a - b)).toEqual(
      Array.from({ length: size }, (_, index) => index + 1),
    );
  });
});

describe('byes', () => {
  it('gives 9 athletes only one first-round match, between 8 and 9', () => {
    const matches = resolveBracket(9, 'doubleRepechage', {});

    expect(matches[0]).toMatchObject({ white: 8, blue: 9, pool: 'A' });
    expect(matches.filter((match) => match.key.startsWith('r1-'))).toHaveLength(1);
  });

  it('gives 10 athletes 8-9 and 7-10 (the IJF example)', () => {
    const firstRound = resolveBracket(10, 'doubleRepechage', {}).filter((match) =>
      match.key.startsWith('r1-'),
    );

    expect(firstRound.map((match) => [match.white, match.blue])).toEqual([
      [8, 9],
      [7, 10],
    ]);
  });

  it('gives the byes to the lowest positions', () => {
    const firstRound = resolveBracket(11, 'doubleRepechage', {}).filter((match) =>
      match.key.startsWith('r1-'),
    );

    expect(firstRound.map((match) => [match.white, match.blue])).toEqual([
      [8, 9],
      [7, 10],
      [6, 11],
    ]);
  });
});

describe('16 athletes (IJF diagram F1.3.14)', () => {
  const matches = playFavourites(16);

  it('has 23 contests', () => {
    expect(matches).toHaveLength(23);
  });

  it('has semifinals between pools A-B and C-D', () => {
    expect(pairs(matches, 'semiFinal')).toEqual([
      [1, 4],
      [2, 3],
    ]);
  });

  it('repechages those who lost to the semifinalist: first round, then quarter-final', () => {
    // Athlete 1 beat 16 and then 8. Athlete 4 beat 13 and then 5.
    const repechage = pairs(matches, 'repechage');

    expect(repechage).toContainEqual([16, 8]);
    expect(repechage).toContainEqual([13, 5]);
    expect(repechage).toContainEqual([15, 7]);
    expect(repechage).toContainEqual([14, 6]);
  });

  it('has each table winner meet the semifinal loser of the opposite table', () => {
    // Table one (pools A and B) produces 5, and meets the loser of 2-3, who is 3.
    expect(pairs(matches, 'bronze')).toEqual([
      [5, 3],
      [6, 4],
    ]);
  });

  it('ends with the final', () => {
    expect(pairs(matches, 'final')).toEqual([[1, 2]]);
  });
});

describe('32 athletes (IJF diagram F1.3.13)', () => {
  it('has 43 contests', () => {
    expect(playFavourites(32)).toHaveLength(43);
  });

  it('runs a three-step repechage in each pool, earliest loser first', () => {
    // Athlete 1 beat 32, then 16, then 8.
    const repechage = pairs(playFavourites(32), 'repechage');

    expect(repechage).toContainEqual([32, 16]);
    expect(repechage).toContainEqual([16, 8]);
  });
});

describe('11 athletes', () => {
  it('has 14 contests if the favourites win', () => {
    expect(playFavourites(11)).toHaveLength(14);
  });

  it('matches the worked example', () => {
    const matches = playFavourites(11);

    expect(pairs(matches, 'semiFinal')).toEqual([
      [1, 4],
      [2, 3],
    ]);
    expect(pairs(matches, 'repechage')).toEqual([
      [8, 5],
      [7, 6],
    ]);
    expect(pairs(matches, 'bronze')).toEqual([
      [5, 3],
      [6, 4],
    ]);
  });

  it('changes the repechage when a result changes', () => {
    // 8 beats 9 as expected, and then beats 1 in the quarter-final.
    const matches = playFavourites(11, 'doubleRepechage', { 'r2-1': { winner: 'blue' } });

    // 8's victims are 9 and 1. They fight first, and the winner (1) meets 5.
    expect(pairs(matches, 'repechage')).toContainEqual([9, 1]);
    expect(pairs(matches, 'repechage')).toContainEqual([1, 5]);
  });
});

describe('small brackets', () => {
  it('runs 8 athletes in 11 contests', () => {
    expect(playFavourites(8)).toHaveLength(11);
  });

  it('runs 5 athletes without getting stuck', () => {
    const matches = playFavourites(5);

    expect(matches.every((match) => match.white !== null && match.blue !== null)).toBe(true);
    expect(pairs(matches, 'final')).toHaveLength(1);
  });

  it('gives 2 athletes only a final', () => {
    expect(playFavourites(2).map((match) => match.part)).toEqual(['final']);
  });

  it('gives bronze without a contest when there is nobody to repechage', () => {
    // With 4 athletes, each pool has one athlete, so no semifinalist has beaten anyone.
    const matches = playFavourites(4);

    expect(matches.filter((match) => match.part === 'bronze')).toHaveLength(0);
  });
});

describe('other formats', () => {
  it('has only quarter-final losers in a quarter-final repechage', () => {
    const repechage = pairs(playFavourites(16, 'quarterFinalRepechage'), 'repechage');

    expect(repechage).toEqual([
      [8, 5],
      [7, 6],
    ]);
  });

  it('has no repechage in a direct knockout', () => {
    const matches = playFavourites(16, 'directKnockout');

    expect(matches).toHaveLength(15);
    expect(pairs(matches, 'repechage')).toEqual([]);
    expect(pairs(matches, 'bronze')).toEqual([]);
  });
});

describe('special results', () => {
  it('keeps a no-show out of the repechage (FPJ Article 43.2)', () => {
    // 16 doesn't turn up against 1, so 8 goes straight through in pool A.
    const matches = playFavourites(16, 'doubleRepechage', {
      'r1-1': { winner: 'white', isLoserOut: true },
    });
    const repechage = pairs(matches, 'repechage');

    expect(repechage.flat()).not.toContain(16);
    expect(repechage).toContainEqual([8, 5]);
  });

  it('has no final when both athletes lose a semifinal', () => {
    // Nobody comes out of the first semifinal, so the other semifinal's winner wins outright.
    const matches = playFavourites(16, 'doubleRepechage', { 'r3-1': { winner: 'none' } });

    expect(pairs(matches, 'final')).toEqual([]);
  });

  it('shows matches that are waiting for an earlier result', () => {
    const matches = resolveBracket(16, 'doubleRepechage', {});
    const quarterFinal = matches.find((match) => match.key === 'r2-1');

    expect(quarterFinal).toMatchObject({ white: null, blue: null, winner: null });
  });

  it('only lists a repechage once its semifinalist is known', () => {
    const matches = resolveBracket(16, 'doubleRepechage', {});

    expect(matches.some((match) => match.key.startsWith('rep-A'))).toBe(false);
  });
});

describe('editing a result', () => {
  it('recalculates everything after it', () => {
    const before = playFavourites(16);
    // Changing the first semifinal so that 4 beats 1.
    const after = playFavourites(16, 'doubleRepechage', { 'r3-1': { winner: 'blue' } });

    expect(pairs(before, 'final')).toEqual([[1, 2]]);
    expect(pairs(after, 'final')).toEqual([[4, 2]]);
    expect(pairs(after, 'bronze')).toEqual([
      [5, 3],
      [6, 1],
    ]);
  });

  it('ignores a later result if the athletes no longer meet', () => {
    const results: BracketResults = {
      // 16 beats 1 this time, although the quarter-final below was fought by 1.
      'r1-1': { white: 1, blue: 16, winner: 'blue' },
      'r1-2': { white: 8, blue: 9, winner: 'white' },
      'r2-1': { white: 1, blue: 8, winner: 'white' },
    };
    const quarterFinal = resolveBracket(16, 'doubleRepechage', results).find(
      (match) => match.key === 'r2-1',
    );

    // Now it's 16 against 8, and the old result must not decide it.
    expect(quarterFinal).toMatchObject({ white: 16, blue: 8, winner: null });
  });
});
