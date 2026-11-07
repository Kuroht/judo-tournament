/**
 * =====================================================
 * FILE: matches.test.ts
 * PURPOSE: Checks how events are saved, and how a category's
 *          contests are listed as results come in.
 * USED BY: npm test
 * =====================================================
 */
import type { MatchEvent } from '@/lib/rules/types';

import { buildCategoryContests, countDependentMatches } from '../buildCategoryContests';
import { fromEventRow, toEventRow } from '../matchEventRows';
import { addCategoryHeadings, buildMatchList, filterMatchList, findNextMatch } from '../matchList';
import type { CategoryContests, Contest, ContestAthlete, FinishedMatch } from '../types';

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

describe('ties that need a new contest (FPJ Article 47.2)', () => {
  // Everyone won once and every time and weight is equal, so every tie-break fails.
  function circularFinish(list: ContestAthlete[], format: 'poule' | 'twoPoules' = 'poule') {
    const finished: FinishedMatch[] = [];
    const firstThree = buildCategoryContests(format, list, []).slice(0, 3);
    const winners = ['white', 'white', 'blue'] as const;

    firstThree.forEach((contest, index) => finished.push(finish(contest, winners[index])));

    return finished;
  }

  it('makes the tied athletes repeat their matches in golden score', () => {
    const list = athletes(3);
    const contests = buildCategoryContests('poule', list, circularFinish(list));
    const playoffs = contests.filter((contest) => contest.isPlayoff);

    expect(contests).toHaveLength(6);
    expect(playoffs).toHaveLength(3);
    expect(playoffs.every((contest) => !contest.isFinished)).toBe(true);
  });

  it('does not ask for new contests while a poule is still being fought', () => {
    const list = athletes(3);
    const contests = buildCategoryContests('poule', list, circularFinish(list).slice(0, 2));

    expect(contests.some((contest) => contest.isPlayoff)).toBe(false);
  });

  it('adds another round if the new contests tie again', () => {
    const list = athletes(3);
    const finished = circularFinish(list);
    const playoffs = buildCategoryContests('poule', list, finished).filter(
      (contest) => contest.isPlayoff,
    );
    const winners = ['white', 'white', 'blue'] as const;
    playoffs.forEach((contest, index) => finished.push(finish(contest, winners[index])));

    expect(buildCategoryContests('poule', list, finished)).toHaveLength(9);
  });

  it('keeps the semifinals waiting until the tie is decided, then fills them', () => {
    const list = athletes(6);
    const finished = circularFinish(list, 'twoPoules');
    const semiFinalWhite = () =>
      buildCategoryContests('twoPoules', list, finished).find(
        (contest) => contest.key === 'cross-1',
      )?.white;

    expect(semiFinalWhite()).toBeNull();

    for (let pass = 0; pass < 10; pass += 1) {
      for (const contest of buildCategoryContests('twoPoules', list, finished)) {
        const isPoule = contest.part === 'poule';
        if (isPoule && contest.white !== null && contest.blue !== null && !contest.isFinished) {
          finished.push(finish(contest));
        }
      }
    }

    expect(semiFinalWhite()).not.toBeNull();
    expect(semiFinalWhite()).toBeDefined();
  });

  /**
   * Fights a poule where the lower position always wins, except that the two given
   * athletes both lose against each other. That leaves them tied for last.
   */
  function hasPlayoffWhenLastTwoTie(
    format: 'poule' | 'twoPoules',
    list: ContestAthlete[],
    tiedPositions: [number, number],
  ) {
    const finished: FinishedMatch[] = [];

    for (const contest of buildCategoryContests(format, list, [])) {
      if (contest.part !== 'poule' || contest.white === null || contest.blue === null) {
        continue;
      }

      const pair = [contest.white.position, contest.blue.position];
      const isTiedPair = tiedPositions.every((position) => pair.includes(position));
      const winner = contest.white.position < contest.blue.position ? 'white' : 'blue';
      const match = finish(contest, winner);
      finished.push(isTiedPair ? { ...match, winnerEntryId: null } : match);
    }

    return buildCategoryContests(format, list, finished).some((contest) => contest.isPlayoff);
  }

  it('settles a tie for 2nd in two poules with one round, because only its winner goes on', () => {
    const list = athletes(8);
    const finished: FinishedMatch[] = [];
    // Poule A is positions 1, 3, 5 and 7. Position 1 wins everything, and 3, 5 and 7 go
    // in a circle. In the new contests, 3 beats both others, and 5 and 7 both lose.
    const firstRoundWinners: Record<string, number> = { '3-5': 3, '5-7': 5, '3-7': 7 };
    const playoffWinners: Record<string, number | null> = { '3-5': 3, '3-7': 3, '5-7': null };

    for (let pass = 0; pass < 6; pass += 1) {
      for (const contest of buildCategoryContests('twoPoules', list, finished)) {
        if (contest.part !== 'poule' || contest.isFinished) {
          continue;
        }

        const low = Math.min(contest.white?.position ?? 0, contest.blue?.position ?? 0);
        const high = Math.max(contest.white?.position ?? 0, contest.blue?.position ?? 0);
        const pair = `${low}-${high}`;
        const winner = (contest.isPlayoff ? playoffWinners[pair] : firstRoundWinners[pair]) ?? low;
        const isBothLost = contest.isPlayoff && playoffWinners[pair] === null;
        const match = finish(contest, contest.white?.position === winner ? 'white' : 'blue');
        finished.push(isBothLost ? { ...match, winnerEntryId: null } : match);
      }
    }

    const contests = buildCategoryContests('twoPoules', list, finished);
    const secondSemiFinal = contests.find((contest) => contest.key === 'cross-2');

    expect(contests.filter((contest) => contest.isPlayoff)).toHaveLength(3);
    expect(secondSemiFinal?.blue?.position).toBe(3);
  });

  it('fights a tie for 3rd in one poule, because it decides a medal', () => {
    expect(hasPlayoffWhenLastTwoTie('poule', athletes(4), [3, 4])).toBe(true);
  });

  it('leaves a tie for 3rd in two poules, because only the top two go on', () => {
    // Poule A is positions 1, 3, 5 and 7.
    expect(hasPlayoffWhenLastTwoTie('twoPoules', athletes(8), [5, 7])).toBe(false);
  });
});

describe('correcting a result', () => {
  it('counts the finished matches that depend on a result', () => {
    const list = athletes(4);
    const { finished, contests } = playAll('directKnockout', list);
    const semiFinal = contests.find((contest) => contest.part === 'semiFinal') as Contest;
    const final = contests.find((contest) => contest.part === 'final') as Contest;

    expect(countDependentMatches('directKnockout', list, finished, semiFinal.key)).toBeGreaterThan(
      0,
    );
    expect(countDependentMatches('directKnockout', list, finished, final.key)).toBe(0);
  });

  it('keeps later results when the same athletes still meet', () => {
    const list = athletes(4);
    const { finished } = playAll('directKnockout', list);
    const before = buildCategoryContests('directKnockout', list, finished);

    // Taking a result away and putting it back changes nothing.
    const without = finished.slice(1);
    const again = buildCategoryContests('directKnockout', list, [
      ...without,
      finished[0] as FinishedMatch,
    ]);

    expect(again.map((contest) => contest.isFinished)).toEqual(
      before.map((contest) => contest.isFinished),
    );
  });

  it('stops counting a later result when the winner changes', () => {
    const list = athletes(4);
    const { finished } = playAll('directKnockout', list);
    const first = finished[0] as FinishedMatch;
    const changed = finished.map((match) =>
      match === first ? { ...match, winnerEntryId: first.blueEntryId } : match,
    );
    const final = buildCategoryContests('directKnockout', list, changed).find(
      (contest) => contest.part === 'final',
    );

    expect(final?.isFinished).toBe(false);
    expect(final?.white?.entryId).toBe(first.blueEntryId);
  });
});

describe('the match list', () => {
  function category(contests: Contest[], runningKeys: string[] = []): CategoryContests {
    return {
      categoryId: 'c1',
      title: 'Cadetes',
      format: 'poule',
      isReady: true,
      runningKeys,
      athletes: [],
      finished: [],
      places: [],
      contests,
    };
  }
  const list = athletes(3);
  const contests = buildCategoryContests('poule', list, []);

  it('finds the first ready match as the next one', () => {
    const items = buildMatchList([category(contests)]);

    expect(findNextMatch(items)?.contest.key).toBe(contests[0]?.key);
  });

  it('puts a running match first', () => {
    const items = buildMatchList([category(contests, [contests[1]?.key ?? ''])]);

    expect(findNextMatch(items)?.contest.key).toBe(contests[1]?.key);
    expect(filterMatchList(items, 'running')).toHaveLength(1);
  });

  it('skips contests that are waiting for athletes', () => {
    const waiting = { ...(contests[0] as Contest), white: null };

    expect(findNextMatch(buildMatchList([category([waiting])]))).toBeNull();
  });

  it('puts one heading above each category', () => {
    const second = { ...category(contests), categoryId: 'c2', title: 'Seniores' };
    const lines = addCategoryHeadings(buildMatchList([category(contests), second]));
    const headings = lines.filter((line) => line.type === 'heading');

    expect(headings.map((line) => line.type === 'heading' && line.title)).toEqual([
      'Cadetes',
      'Seniores',
    ]);
    expect(lines[0]?.type).toBe('heading');
    expect(lines).toHaveLength(contests.length * 2 + 2);
  });

  it('filters finished and to-do matches', () => {
    const done = { ...(contests[0] as Contest), isFinished: true };
    const items = buildMatchList([category([done, contests[1] as Contest])]);

    expect(filterMatchList(items, 'finished')).toHaveLength(1);
    expect(filterMatchList(items, 'toDo')).toHaveLength(1);
    expect(filterMatchList(items, 'all')).toHaveLength(2);
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
