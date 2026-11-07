/**
 * =====================================================
 * FILE: poules.test.ts
 * PURPOSE: Worked examples of poules, their ranking and
 *          the two-poule finals (FPJ Articles 38 to 47).
 * USED BY: npm test
 * =====================================================
 */
import type { ResultType } from '@/lib/rules/types';

import type { DrawAthlete } from '../assignDrawPositions';
import { assignPoulePositions } from '../assignPoulePositions';
import {
  getPouleSchedule,
  isBestOfThreeOver,
  putSameClubMatchesFirst,
  splitIntoTwoPoules,
} from '../pouleSchedule';
import { pointsForWin, rankPoule, type PouleResult } from '../rankPoule';
import { getTwoPoulesFinals } from '../twoPoulesFinals';

function win(
  winner: number,
  loser: number,
  resultType: ResultType = 'ippon',
  durationSeconds = 60,
): PouleResult {
  return { white: winner, blue: loser, winner: 'white', resultType, durationSeconds };
}

function athletes(count: number, weights: Record<number, number> = {}) {
  return Array.from({ length: count }, (_, index) => ({
    position: index + 1,
    weighedKg: weights[index + 1] ?? 50,
  }));
}

function order(result: ReturnType<typeof rankPoule>) {
  return result.map((standing) => standing.position);
}

describe('getPouleSchedule', () => {
  it('uses the FPJ order for 3, 4 and 5 athletes', () => {
    expect(getPouleSchedule(3)).toEqual([[1, 2], [2, 3], [1, 3]]);
    expect(getPouleSchedule(4)).toEqual([[1, 2], [3, 4], [1, 3], [2, 4], [1, 4], [2, 3]]);
    expect(getPouleSchedule(5)).toEqual([
      [4, 5], [1, 2], [3, 4], [1, 5], [2, 3], [1, 4], [3, 5], [2, 4], [1, 3], [2, 5],
    ]);
  });

  it('gives 2 athletes the best of three', () => {
    expect(getPouleSchedule(2)).toHaveLength(3);
  });

  it.each([3, 4, 5, 6, 7, 8])('has everyone meet everyone exactly once with %i athletes', (count) => {
    const schedule = getPouleSchedule(count);
    const unique = new Set(schedule.map(([first, second]) => `${first}-${second}`));

    expect(schedule).toHaveLength((count * (count - 1)) / 2);
    expect(unique.size).toBe(schedule.length);
  });
});

describe('putSameClubMatchesFirst (FPJ Article 40.5)', () => {
  it('moves clubmates to the front and keeps the rest in order', () => {
    const clubs: Record<number, string> = { 1: 'a', 3: 'a' };

    expect(putSameClubMatchesFirst(getPouleSchedule(3), (p) => clubs[p] ?? null)).toEqual([
      [1, 3], [1, 2], [2, 3],
    ]);
  });

  it('never treats athletes with no club as clubmates', () => {
    expect(putSameClubMatchesFirst(getPouleSchedule(3), () => null)).toEqual(getPouleSchedule(3));
  });
});

describe('isBestOfThreeOver', () => {
  it('ends when someone has two wins', () => {
    expect(isBestOfThreeOver([1, 1])).toBe(false);
    expect(isBestOfThreeOver([2, 0])).toBe(true);
    expect(isBestOfThreeOver([1, 2])).toBe(true);
  });
});

describe('splitIntoTwoPoules (FPJ Article 38)', () => {
  it.each([
    [6, [3, 3]],
    [7, [4, 3]],
    [8, [4, 4]],
  ])('splits %i athletes evenly', (count, sizes) => {
    const [a, b] = splitIntoTwoPoules(Array.from({ length: count }, (_, i) => i + 1));

    expect([a.length, b.length]).toEqual(sizes);
  });

  it('sends the first two positions to different poules', () => {
    const [a, b] = splitIntoTwoPoules([1, 2, 3, 4]);

    expect(a).toContain(1);
    expect(b).toContain(2);
  });
});

describe('pointsForWin (FPJ Articles 41 and 43)', () => {
  it.each<[ResultType, number]>([
    ['ippon', 100],
    ['wazaAriAwasete', 100],
    ['wazaAri', 10],
    ['yuko', 1],
    ['decision', 0.5],
    ['fusenGachi', 100],
    ['hansokuMake', 100],
    ['kikenGachi', 100],
  ])('gives a win by %s %d points', (resultType, points) => {
    expect(pointsForWin(resultType)).toBe(points);
  });
});

describe('rankPoule (FPJ Article 47)', () => {
  it('ranks by wins first, whatever the points', () => {
    // 1 won twice by yuko (2 points). 2 won once by ippon (100 points).
    const results = [win(1, 2, 'yuko'), win(1, 3, 'yuko'), win(2, 3, 'ippon')];

    expect(order(rankPoule(athletes(3), results, true))).toEqual([1, 2, 3]);
  });

  it('breaks a tie on wins with points', () => {
    // A circle: everyone has one win, but 2 won by ippon.
    const results = [win(1, 2, 'wazaAri'), win(2, 3, 'ippon'), win(3, 1, 'yuko')];

    expect(order(rankPoule(athletes(3), results, true))).toEqual([2, 1, 3]);
  });

  it('counts only the winner points, as the FPJ does', () => {
    const [first, second] = rankPoule(athletes(2), [win(1, 2, 'wazaAri')], true);

    expect(first?.points).toBe(10);
    expect(second?.points).toBe(0);
  });

  it('breaks a tie on wins and points with the result between them', () => {
    // 1 and 2 both have two wins by ippon, and 1 beat 2. So do 3 and 4 with one win,
    // and 3 beat 4. Athlete 2 and 4's shorter times must not matter, as this comes first.
    const results = [
      win(1, 2, 'ippon', 90),
      win(1, 3, 'ippon', 90),
      win(2, 3, 'ippon', 10),
      win(2, 4, 'ippon', 10),
      win(3, 4, 'ippon', 90),
      win(4, 1, 'ippon', 10),
    ];

    expect(order(rankPoule(athletes(4), results, true))).toEqual([1, 2, 3, 4]);
  });

  it('breaks an even circle with the shortest winning time', () => {
    const results = [win(1, 2, 'ippon', 90), win(2, 3, 'ippon', 30), win(3, 1, 'ippon', 60)];

    expect(order(rankPoule(athletes(3), results, true))).toEqual([2, 3, 1]);
  });

  it('then breaks it with the lightest athlete', () => {
    const results = [win(1, 2, 'ippon', 60), win(2, 3, 'ippon', 60), win(3, 1, 'ippon', 60)];
    const standings = rankPoule(athletes(3, { 1: 52, 2: 50, 3: 51 }), results, true);

    expect(order(standings)).toEqual([2, 3, 1]);
  });

  it('asks for a playoff when every tie-break fails, sharing the place', () => {
    const results = [win(1, 2, 'ippon', 60), win(2, 3, 'ippon', 60), win(3, 1, 'ippon', 60)];
    const standings = rankPoule(athletes(3), results, true);

    expect(standings.every((standing) => standing.needsPlayoff)).toBe(true);
    expect(standings.map((standing) => standing.place)).toEqual([1, 1, 1]);
  });

  it('keeps a playoff to those still tied, with later places correct', () => {
    // 1 beats everyone. 2, 3 and 4 form an identical circle.
    const results = [
      win(1, 2), win(1, 3), win(1, 4), win(2, 3), win(3, 4), win(4, 2),
    ];
    const standings = rankPoule(athletes(4), results, true);

    expect(standings[0]).toMatchObject({ position: 1, place: 1, needsPlayoff: false });
    expect(standings.slice(1).map((standing) => standing.place)).toEqual([2, 2, 2]);
  });

  it('gives nobody the win when both lose', () => {
    const both: PouleResult = { white: 1, blue: 2, winner: 'none', resultType: null, durationSeconds: 60 };

    expect(rankPoule(athletes(2), [both], true).map((standing) => standing.wins)).toEqual([0, 0]);
  });

  it('annuls the matches of an athlete who withdrew, and ranks them last', () => {
    // 3 beat 1 and then withdrew, so that win doesn't count and 1 stays ahead of 2.
    const results = [win(1, 2), win(3, 1), win(3, 2)];
    const standings = rankPoule(athletes(3), results, true, [3]);

    expect(order(standings)).toEqual([1, 2, 3]);
    expect(standings[0]?.wins).toBe(1);
    expect(standings[2]).toMatchObject({ isOut: true, place: 3, wins: 0 });
  });

  it('does not ask for a playoff before the poule has finished', () => {
    const notStarted = rankPoule(athletes(3), [], false);
    const partlyPlayed = rankPoule(athletes(3), [win(1, 2)], false);

    expect(notStarted).toHaveLength(3);
    expect(notStarted.some((standing) => standing.needsPlayoff)).toBe(false);
    expect(partlyPlayed.some((standing) => standing.needsPlayoff)).toBe(false);
  });
});

describe('getTwoPoulesFinals (FPJ Article 38)', () => {
  it('crosses the first of each poule with the second of the other', () => {
    const [first, second] = getTwoPoulesFinals([1, 3], [2, 4], {});

    expect(first).toMatchObject({ white: 1, blue: 4 });
    expect(second).toMatchObject({ white: 2, blue: 3 });
  });

  it('sends the semifinal winners to the final', () => {
    const results = {
      'cross-1': { white: 1, blue: 4, winner: 'blue' as const },
      'cross-2': { white: 2, blue: 3, winner: 'white' as const },
    };

    expect(getTwoPoulesFinals([1, 3], [2, 4], results)[2]).toMatchObject({ white: 4, blue: 2 });
  });

  it('lists no final when both athletes lose a semifinal', () => {
    const results = {
      'cross-1': { white: 1, blue: 4, winner: 'none' as const },
      'cross-2': { white: 2, blue: 3, winner: 'white' as const },
    };
    const matches = getTwoPoulesFinals([1, 3], [2, 4], results);

    // Nobody came out of the first semifinal, so athlete 2 has nobody to fight.
    expect(matches.map((match) => match.key)).toEqual(['cross-1', 'cross-2']);
  });

  it('waits while the poules are still being fought', () => {
    const [first, , final] = getTwoPoulesFinals([null, null], [null, null], {});

    expect(first).toMatchObject({ white: null, blue: null });
    expect(final).toMatchObject({ white: null, blue: null });
  });

  it('ignores an old result if the standings change', () => {
    const results = { 'cross-1': { white: 1, blue: 4, winner: 'white' as const } };

    expect(getTwoPoulesFinals([1, 3], [2, 5], results)[0]?.winner).toBeNull();
  });
});

describe('assignPoulePositions', () => {
  const create = (clubs: (string | null)[]): DrawAthlete[] =>
    clubs.map((clubId, index) => ({ entryId: `entry-${index}`, clubId, seed: null }));

  it('gives everyone a different position and repeats for the same code', () => {
    const list = create(['a', 'a', 'b', null, 'c']);
    const positions = assignPoulePositions(list, 'SEED', 1);

    expect([...positions.values()].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(assignPoulePositions(list, 'SEED', 1)).toEqual(positions);
  });

  it('splits a club evenly across two poules, in many draws', () => {
    const list = create(['a', 'a', 'a', 'a', 'b', 'c', 'd', 'e']);

    for (let run = 0; run < 50; run += 1) {
      const positions = assignPoulePositions(list, `run-${run}`, 2);
      const inA = list
        .filter((athlete) => athlete.clubId === 'a')
        .filter((athlete) => (positions.get(athlete.entryId) ?? 0) % 2 === 1).length;

      expect(inA).toBe(2);
    }
  });

  it('puts seeds first, so that seeds 1 and 2 are in different poules', () => {
    const list = create(['a', 'b', 'c', 'd', 'e', 'f']);
    list[4] = { entryId: 'entry-4', clubId: 'e', seed: 1 };
    list[2] = { entryId: 'entry-2', clubId: 'c', seed: 2 };
    const positions = assignPoulePositions(list, 'SEED', 2);

    expect(positions.get('entry-4')).toBe(1);
    expect(positions.get('entry-2')).toBe(2);
  });
});
