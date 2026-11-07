/**
 * =====================================================
 * FILE: matches.test.ts
 * PURPOSE: Checks how events are saved, and how a category's
 *          contests are listed as results come in.
 * USED BY: npm test
 * =====================================================
 */
import type { MatchEvent } from '@/lib/rules/types';

import { buildCategoryContests } from '../buildCategoryContests';
import { fromEventRow, toEventRow } from '../matchEventRows';
import type { Contest, ContestAthlete, FinishedMatch } from '../types';

function athletes(count: number, clubs: Record<number, string> = {}): ContestAthlete[] {
  return Array.from({ length: count }, (_, index) => ({
    entryId: `e${index + 1}`,
    name: `Athlete ${index + 1}`,
    clubId: clubs[index + 1] ?? null,
    clubName: null,
    position: index + 1,
    weighedKg: 50,
  }));
}

function finish(contest: Contest, winner: 'white' | 'blue' = 'white'): FinishedMatch {
  return {
    matchKey: contest.key,
    whiteEntryId: contest.white?.entryId ?? '',
    blueEntryId: contest.blue?.entryId ?? '',
    winnerEntryId: (winner === 'white' ? contest.white : contest.blue)?.entryId ?? null,
    resultType: 'ippon',
    durationSeconds: 60,
  };
}

/** Finishes every ready contest, repeating until nothing new appears. */
function playAll(format: Parameters<typeof buildCategoryContests>[0], list: ContestAthlete[]) {
  const finished: FinishedMatch[] = [];
  let contests: Contest[] = [];

  for (let pass = 0; pass < 20; pass += 1) {
    contests = buildCategoryContests(format, list, finished);
    for (const contest of contests) {
      const isReady = contest.white !== null && contest.blue !== null && !contest.isFinished;
      if (isReady) {
        finished.push(finish(contest));
      }
    }
  }

  return { contests: buildCategoryContests(format, list, finished), finished };
}

describe('match event rows', () => {
  const events: MatchEvent[] = [
    { type: 'score', side: 'white', score: 'ippon' },
    { type: 'score', side: 'blue', score: 'wazaAri' },
    { type: 'score', side: 'white', score: 'yuko' },
    { type: 'shido', side: 'blue' },
    { type: 'shidoBoth' },
    { type: 'shidoRemoved', side: 'white' },
    { type: 'hansokuMake', side: 'blue' },
    { type: 'hansokuMakeBoth' },
    { type: 'kikenGachi', withdrawnSide: 'white' },
    { type: 'fusenGachi', absentSide: 'blue' },
    { type: 'timeUp' },
    { type: 'decision', winner: 'blue' },
  ];

  it.each(events)('saves and restores %j unchanged', (event) => {
    expect(fromEventRow(toEventRow(event))).toEqual(event);
  });

  it('ignores an event it does not understand', () => {
    expect(fromEventRow({ type: 'somethingNew', side: 'white' })).toBeNull();
    expect(fromEventRow({ type: 'ippon', side: null })).toBeNull();
  });
});

describe('elimination contests', () => {
  it('lists the first matches of 16 athletes', () => {
    const contests = buildCategoryContests('doubleRepechage', athletes(16), []);
    const first = contests[0];

    expect(first?.white?.position).toBe(1);
    expect(first?.blue?.position).toBe(16);
    expect(first?.isFinished).toBe(false);
  });

  it('reaches all 23 contests as results come in', () => {
    const { contests } = playAll('doubleRepechage', athletes(16));

    expect(contests).toHaveLength(23);
    expect(contests.every((contest) => contest.isFinished)).toBe(true);
  });

  it.each([2, 3, 5, 6, 7, 9, 12, 13, 17, 32])(
    'can always finish a bracket of %i athletes, with no contest left stuck',
    (count) => {
      const { contests } = playAll('doubleRepechage', athletes(count));

      expect(contests.every((contest) => contest.isFinished)).toBe(true);
    },
  );

  it('keeps a no-show out of the repechage', () => {
    const list = athletes(16);
    const first = buildCategoryContests('doubleRepechage', list, [])[0] as Contest;
    const noShow = { ...finish(first), resultType: 'fusenGachi' as const };
    const finished: FinishedMatch[] = [noShow];

    for (let pass = 0; pass < 20; pass += 1) {
      for (const contest of buildCategoryContests('doubleRepechage', list, finished)) {
        if (contest.white !== null && contest.blue !== null && !contest.isFinished) {
          finished.push(finish(contest));
        }
      }
    }

    const repechage = buildCategoryContests('doubleRepechage', list, finished).filter(
      (contest) => contest.part === 'repechage',
    );
    expect(repechage.some((contest) => contest.white?.position === 16)).toBe(false);
    expect(repechage.some((contest) => contest.blue?.position === 16)).toBe(false);
  });

  it('does not count an old result if the athletes changed', () => {
    const list = athletes(16);
    const contest = buildCategoryContests('doubleRepechage', list, [])[0] as Contest;
    const stale = { ...finish(contest), whiteEntryId: 'e2' };

    expect(buildCategoryContests('doubleRepechage', list, [stale])[0]?.isFinished).toBe(false);
  });
});

describe('poule contests', () => {
  it('lists one poule in the FPJ order', () => {
    const contests = buildCategoryContests('poule', athletes(3), []);

    expect(contests.map((contest) => [contest.white?.position, contest.blue?.position])).toEqual([
      [1, 2],
      [2, 3],
      [1, 3],
    ]);
  });

  it('puts clubmates first', () => {
    const contests = buildCategoryContests('poule', athletes(3, { 1: 'a', 3: 'a' }), []);

    expect(contests[0]?.white?.position).toBe(1);
    expect(contests[0]?.blue?.position).toBe(3);
  });

  it('lists a best of three one match at a time', () => {
    const list = athletes(2);
    const [first] = buildCategoryContests('poule', list, []);

    expect(buildCategoryContests('poule', list, [])).toHaveLength(1);
    expect(buildCategoryContests('poule', list, [finish(first as Contest)])).toHaveLength(2);
  });

  it('stops a best of three when someone has won twice', () => {
    expect(playAll('poule', athletes(2)).contests).toHaveLength(2);
  });

  it('plays the third match of a best of three when it is one win each', () => {
    const list = athletes(2);
    const [first] = buildCategoryContests('poule', list, []);
    const finished = [finish(first as Contest, 'white')];
    const second = buildCategoryContests('poule', list, finished)[1] as Contest;
    finished.push(finish(second, 'blue'));

    expect(buildCategoryContests('poule', list, finished)).toHaveLength(3);
  });
});

describe('two poules', () => {
  it('splits 8 athletes into poules of 6 matches, then crossed semifinals and a final', () => {
    const contests = buildCategoryContests('twoPoules', athletes(8), []);

    expect(contests.filter((contest) => contest.pouleName === 'A')).toHaveLength(6);
    expect(contests.filter((contest) => contest.pouleName === 'B')).toHaveLength(6);
    expect(contests.filter((contest) => contest.part === 'semiFinal')).toHaveLength(2);
  });

  it('keeps the semifinals waiting while the poules are being fought', () => {
    const semiFinal = buildCategoryContests('twoPoules', athletes(8), []).find(
      (contest) => contest.part === 'semiFinal',
    );

    expect(semiFinal?.white).toBeNull();
  });

  it('crosses the top two of each poule when the poules finish', () => {
    const { contests } = playAll('twoPoules', athletes(8));
    const [first, second, final] = contests.filter((contest) => contest.pouleName === null);

    // In poule A (1, 3, 5, 7) and poule B (2, 4, 6, 8) the lower number always wins.
    expect([first?.white?.position, first?.blue?.position]).toEqual([1, 4]);
    expect([second?.white?.position, second?.blue?.position]).toEqual([2, 3]);
    expect([final?.white?.position, final?.blue?.position]).toEqual([1, 2]);
  });
});
