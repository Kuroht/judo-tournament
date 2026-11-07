/**
 * =====================================================
 * FILE: results.test.ts
 * PURPOSE: Worked examples of final places, withdrawals,
 *          the medal table and athlete history.
 * USED BY: npm test
 * =====================================================
 */
import type { CategoryFormat } from '@/features/categories';
import type { CategoryContests, Contest, ContestAthlete } from '@/features/matches';
import { resolveCategory } from '@/features/matches/buildCategoryContests';
import type { FinishedMatch } from '@/features/matches/types';
import type { ResultType } from '@/lib/rules/types';

import { buildMedalTable, findPlace, toCategoryResult, toHistoryMatches } from '../buildResults';
import type { CategoryResult } from '../types';

function athletes(count: number): ContestAthlete[] {
  return Array.from({ length: count }, (_, index) => ({
    entryId: `e${index + 1}`,
    name: `Athlete ${index + 1}`,
    // Everyone has their own club, so that no match moves to the front of a poule.
    clubId: `club${index}`,
    clubName: `Club ${index}`,
    position: index + 1,
    weighedKg: 50,
  }));
}

type Decide = (contest: Contest) => {
  winner: 'white' | 'blue' | 'none';
  resultType?: ResultType;
};

/** Fights every contest, deciding each one with the function given. */
function fight(format: CategoryFormat, list: ContestAthlete[], decide: Decide) {
  const finished: FinishedMatch[] = [];

  // One contest at a time, because each result can change which contests are still to come.
  for (let count = 0; count < 100; count += 1) {
    const contest = resolveCategory(format, list, finished).contests.find(
      (other) => other.white !== null && other.blue !== null && !other.isFinished,
    );
    if (contest?.white == null || contest.blue === null) {
      break;
    }

    const { winner, resultType = 'ippon' } = decide(contest);
    let winnerEntryId: string | null = null;
    if (winner !== 'none') {
      winnerEntryId = (winner === 'white' ? contest.white : contest.blue).entryId;
    }

    finished.push({
      matchKey: contest.key,
      whiteEntryId: contest.white.entryId,
      blueEntryId: contest.blue.entryId,
      winnerEntryId,
      resultType,
      durationSeconds: 60,
    });
  }

  return { ...resolveCategory(format, list, finished), finished };
}

// The lower draw position always wins, so the outcome is easy to predict.
const lowerWins: Decide = (contest) => ({
  winner: (contest.white?.position ?? 0) < (contest.blue?.position ?? 0) ? 'white' : 'blue',
});

function placesOf(places: { position: number; place: number }[]) {
  return [...places]
    .sort((first, second) => first.place - second.place || first.position - second.position)
    .map(({ position, place }) => [place, position]);
}

describe('elimination places', () => {
  it('gives 1st, 2nd, two 3rds and two 5ths with 8 athletes', () => {
    const { places } = fight('doubleRepechage', athletes(8), lowerWins);

    expect(places.filter((other) => other.place === 1)).toHaveLength(1);
    expect(places.filter((other) => other.place === 2)).toHaveLength(1);
    expect(places.filter((other) => other.place === 3)).toHaveLength(2);
    expect(places.filter((other) => other.place === 5)).toHaveLength(2);
    expect(placesOf(places)[0]).toEqual([1, 1]);
    expect(placesOf(places)[1]).toEqual([2, 2]);
  });

  it('gives a medal won by a walkover, which is not a contest', () => {
    // With 4 athletes there is no repechage, so the semifinal losers take bronze unopposed.
    const { places } = fight('doubleRepechage', athletes(4), lowerWins);

    expect(places.filter((other) => other.place === 3)).toHaveLength(2);
    expect(places.some((other) => other.place === 5)).toBe(false);
  });

  it('places both athletes 2nd when both lose the final', () => {
    const decide: Decide = (contest) =>
      contest.part === 'final' ? { winner: 'none', resultType: 'hansokuMake' } : lowerWins(contest);
    const { places } = fight('doubleRepechage', athletes(4), decide);

    expect(places.some((other) => other.place === 1)).toBe(false);
    expect(places.filter((other) => other.place === 2)).toHaveLength(2);
  });

  it('places both athletes 5th when both lose a semifinal', () => {
    const decide: Decide = (contest) => {
      const isThisSemiFinal = contest.part === 'semiFinal' && contest.white?.position === 1;

      return isThisSemiFinal ? { winner: 'none', resultType: 'hansokuMake' } : lowerWins(contest);
    };
    const { places } = fight('doubleRepechage', athletes(4), decide);

    expect(places.filter((other) => other.place === 5)).toHaveLength(2);
    expect(places.filter((other) => other.place === 1)).toHaveLength(1);
  });

  it('gives direct knockout two 3rds and no 5ths', () => {
    const { places } = fight('directKnockout', athletes(8), lowerWins);

    expect(places.filter((other) => other.place === 3)).toHaveLength(2);
    expect(places.some((other) => other.place === 5)).toBe(false);
  });
});

describe('poule places', () => {
  it('orders one poule by its results', () => {
    const { places } = fight('poule', athletes(4), lowerWins);

    expect(placesOf(places)).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
  });

  it('gives two poules 1st, 2nd and two 3rds', () => {
    const { places } = fight('twoPoules', athletes(8), lowerWins);

    expect(placesOf(places)).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
      [3, 4],
    ]);
  });
});

describe('withdrawals in a poule (FPJ Articles 43 and 44)', () => {
  /** Athlete 1 loses their first match by the given result, and the lower number wins the rest. */
  function withFirstMatchLostBy(resultType: ResultType): Decide {
    return (contest) => {
      const isFirstMatch = contest.white?.position === 1 && contest.blue?.position === 2;

      return isFirstMatch ? { winner: 'blue', resultType } : lowerWins(contest);
    };
  }

  it.each(['fusenGachi', 'kikenGachi'] as const)(
    'eliminates athlete 1 after %s, drops their other matches and gives no place',
    (resultType) => {
      const { contests, places } = fight('poule', athletes(4), withFirstMatchLostBy(resultType));

      // 1 v 2 stays listed, but 1 v 3 and 1 v 4 never happen. Then 2 v 3, 3 v 4 and 2 v 4.
      expect(contests).toHaveLength(4);
      expect(placesOf(places)).toEqual([
        [1, 2],
        [2, 3],
        [3, 4],
      ]);
    },
  );

  it('annuls the win over the athlete who is eliminated', () => {
    // Athletes 2, 3 and 4 beat each other in a circle. Athlete 2 also beat the no-show. If
    // that win counted, athlete 2 would simply be 1st. Annulled, it's a three-way tie.
    const winnerInCircle: Record<string, number> = { '2-3': 3, '3-4': 4, '2-4': 2 };
    const decide: Decide = (contest) => {
      const white = contest.white?.position ?? 0;
      const blue = contest.blue?.position ?? 0;

      if (contest.isPlayoff) {
        return lowerWins(contest);
      }
      if (white === 1 && blue === 2) {
        return { winner: 'blue', resultType: 'fusenGachi' };
      }

      const pair = `${Math.min(white, blue)}-${Math.max(white, blue)}`;

      return { winner: winnerInCircle[pair] === white ? 'white' : 'blue' };
    };
    const { contests, places } = fight('poule', athletes(4), decide);

    expect(contests.some((contest) => contest.isPlayoff)).toBe(true);
    expect(placesOf(places)).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ]);
  });

  it('keeps the results of an athlete injured in their last match', () => {
    // In a poule of 3, the schedule is 1 v 2, 2 v 3, 1 v 3, so 1 v 3 is 3's last match.
    const decide: Decide = (contest) => {
      const isLast = contest.white?.position === 1 && contest.blue?.position === 3;

      return isLast ? { winner: 'white', resultType: 'kikenGachi' } : lowerWins(contest);
    };
    const { contests, places } = fight('poule', athletes(3), decide);

    expect(contests).toHaveLength(3);
    expect(placesOf(places)).toEqual([
      [1, 1],
      [2, 2],
      [3, 3],
    ]);
  });

  it('keeps the loser 2nd when they withdraw from a best of three', () => {
    const decide: Decide = (contest) =>
      contest.key.endsWith('-2')
        ? { ...lowerWins(contest), resultType: 'kikenGachi' }
        : lowerWins(contest);
    const { places } = fight('poule', athletes(2), decide);

    expect(placesOf(places)).toEqual([
      [1, 1],
      [2, 2],
    ]);
  });

  it('does not count a later match against someone already out', () => {
    // In a poule of 4, athlete 3 is absent from 3 v 4. Athlete 2 then withdraws from 2 v 4.
    // Their only match left was against athlete 3, so it was their last, and they keep a place.
    const decide: Decide = (contest) => {
      const pair = [contest.white?.position, contest.blue?.position];

      if (pair.includes(3) && pair.includes(4)) {
        return {
          winner: contest.white?.position === 4 ? 'white' : 'blue',
          resultType: 'fusenGachi',
        };
      }
      if (pair.includes(2) && pair.includes(4)) {
        return {
          winner: contest.white?.position === 4 ? 'white' : 'blue',
          resultType: 'kikenGachi',
        };
      }

      return lowerWins(contest);
    };
    const { places } = fight('poule', athletes(4), decide);

    expect(placesOf(places)).toEqual([
      [1, 1],
      [2, 4],
      [3, 2],
    ]);
  });

  it('shares a place between athletes whose tie decides no medal', () => {
    // Athletes 4 and 5 both lose to each other and to everyone else, so they tie for 4th.
    const decide: Decide = (contest) => {
      const pair = [contest.white?.position, contest.blue?.position];

      return pair.includes(4) && pair.includes(5)
        ? { winner: 'none', resultType: 'hansokuMake' }
        : lowerWins(contest);
    };
    const { contests, places } = fight('poule', athletes(5), decide);

    expect(contests.some((contest) => contest.isPlayoff)).toBe(false);
    expect(placesOf(places).slice(3)).toEqual([
      [4, 4],
      [4, 5],
    ]);
  });

  it('still gives gold when one semifinal is a bye and both lose the other', () => {
    // Poule A is 1 and 3, poule B is 2 and 4. Athlete 4 is absent, so athlete 1 has a bye.
    const decide: Decide = (contest) => {
      const pair = [contest.white?.position, contest.blue?.position];

      if (contest.part === 'semiFinal') {
        return { winner: 'none', resultType: 'hansokuMake' };
      }
      if (pair.includes(2) && pair.includes(4)) {
        return {
          winner: contest.white?.position === 2 ? 'white' : 'blue',
          resultType: 'fusenGachi',
        };
      }

      return lowerWins(contest);
    };
    const { places } = fight('twoPoules', athletes(4), decide);

    expect(placesOf(places)).toEqual([
      [1, 1],
      [5, 2],
      [5, 3],
    ]);
  });

  it('still reaches a final when withdrawals leave a poule with one athlete', () => {
    // Poule A is positions 1 and 3. Athlete 1 doesn't turn up, leaving only 3.
    const decide: Decide = (contest) => {
      const pair = [contest.white?.position, contest.blue?.position];

      return pair.includes(1) && pair.includes(3)
        ? { winner: contest.white?.position === 3 ? 'white' : 'blue', resultType: 'fusenGachi' }
        : lowerWins(contest);
    };
    const { contests } = fight('twoPoules', athletes(4), decide);

    expect(contests.every((contest) => contest.isFinished)).toBe(true);
    expect(contests.some((contest) => contest.part === 'final')).toBe(true);
  });
});

function toCategory(format: CategoryFormat, list: ContestAthlete[], decide: Decide) {
  const { contests, places, finished } = fight(format, list, decide);
  const category: CategoryContests = {
    categoryId: format,
    title: format,
    format,
    isReady: true,
    runningKeys: [],
    athletes: list,
    finished,
    contests,
    places,
  };

  return category;
}

describe('category results', () => {
  it('is complete only when every contest has finished', () => {
    const category = toCategory('poule', athletes(3), lowerWins);
    const unfinished = {
      ...category,
      contests: category.contests.map((contest, index) =>
        index === 0 ? { ...contest, isFinished: false } : contest,
      ),
    };

    expect(toCategoryResult(category).isComplete).toBe(true);
    expect(toCategoryResult(unfinished).isComplete).toBe(false);
    expect(toCategoryResult(unfinished).finishedCount).toBe(2);
  });
});

describe('the medal table', () => {
  const result = (placed: [number, string][], isComplete = true): CategoryResult => ({
    categoryId: 'c',
    title: 'c',
    isComplete,
    finishedCount: 1,
    totalCount: 1,
    placed: placed.map(([place, clubId]) => ({
      place,
      athlete: {
        entryId: `${clubId}${place}`,
        name: 'x',
        clubId: clubId === 'none' ? null : clubId,
        clubName: clubId === 'none' ? null : clubId,
        position: place,
        weighedKg: null,
      },
    })),
  });

  it('counts gold first, then silver, then bronze', () => {
    const table = buildMedalTable([
      result([
        [1, 'B'],
        [2, 'A'],
        [3, 'A'],
        [3, 'C'],
      ]),
    ]);

    expect(table.map((row) => row.clubName)).toEqual(['B', 'A', 'C']);
    expect(table[1]).toMatchObject({ gold: 0, silver: 1, bronze: 1 });
  });

  it('adds up across categories, with no medal for 5th', () => {
    const table = buildMedalTable([
      result([
        [1, 'A'],
        [5, 'B'],
      ]),
      result([[1, 'A']]),
    ]);

    expect(table).toHaveLength(1);
    expect(table[0]?.gold).toBe(2);
  });

  it('ignores a category that has not finished', () => {
    expect(buildMedalTable([result([[1, 'A']], false)])).toEqual([]);
  });

  it('groups athletes with no club together', () => {
    const table = buildMedalTable([
      result([
        [1, 'none'],
        [2, 'none'],
      ]),
    ]);

    expect(table).toHaveLength(1);
    expect(table[0]).toMatchObject({ clubId: null, gold: 1, silver: 1 });
  });
});

describe('athlete history', () => {
  const category = toCategory('poule', athletes(3), lowerWins);

  it('lists the matches an athlete fought, against whom and how', () => {
    const matches = toHistoryMatches(category, 'e3');

    expect(matches).toHaveLength(2);
    expect(matches.every((match) => !match.didWin)).toBe(true);
    expect(matches[0]).toMatchObject({ opponentName: 'Athlete 2', resultType: 'ippon' });
  });

  it('finds the place once the category has finished', () => {
    expect(findPlace(category, 'e1')).toBe(1);
  });

  it('gives no place while the category is still running', () => {
    const running = {
      ...category,
      contests: category.contests.map((contest) => ({ ...contest, isFinished: false })),
    };

    expect(findPlace(running, 'e1')).toBeNull();
  });
});
