/**
 * =====================================================
 * FILE: assignDrawPositions.test.ts
 * PURPOSE: Checks the draw: fair, repeatable, and keeping
 *          clubs apart where possible.
 * USED BY: npm test
 * =====================================================
 */
import {
  assignDrawPositions,
  findClubConflicts,
  type DrawAthlete,
} from '../assignDrawPositions';
import { createDrawSeed, createSeededRandom, shuffle } from '../seededRandom';
import { suggestFormat } from '../suggestFormat';

function createAthletes(clubs: (string | null)[]): DrawAthlete[] {
  return clubs.map((clubId, index) => ({ entryId: `entry-${index}`, clubId, seed: null }));
}

function sortedPositions(positions: Map<string, number>) {
  return [...positions.values()].sort((a, b) => a - b);
}

describe('assignDrawPositions', () => {
  it('gives everyone a different position, from 1 upward', () => {
    const positions = assignDrawPositions(createAthletes(Array(11).fill(null)), 'SEED');

    expect(sortedPositions(positions)).toEqual(Array.from({ length: 11 }, (_, i) => i + 1));
  });

  it('gives the same draw for the same seed', () => {
    const athletes = createAthletes(['a', 'a', 'b', 'c', null, 'b', 'd', 'e', 'f']);

    expect(assignDrawPositions(athletes, 'K7QM2X')).toEqual(
      assignDrawPositions(athletes, 'K7QM2X'),
    );
  });

  it('gives the same draw whatever order the athletes arrive in', () => {
    const athletes = createAthletes(['a', 'a', 'b', 'c', null, 'b', 'd', 'e', 'f']);

    expect(assignDrawPositions([...athletes].reverse(), 'SEED')).toEqual(
      assignDrawPositions(athletes, 'SEED'),
    );
  });

  it('usually gives a different draw for a different seed', () => {
    const athletes = createAthletes(Array(16).fill(null));

    expect(assignDrawPositions(athletes, 'ONE')).not.toEqual(assignDrawPositions(athletes, 'TWO'));
  });

  it('puts seeds in the lowest positions, in order', () => {
    const athletes = createAthletes(Array(11).fill(null));
    athletes[5] = { ...(athletes[5] as DrawAthlete), seed: 1 };
    athletes[9] = { ...(athletes[9] as DrawAthlete), seed: 2 };

    const positions = assignDrawPositions(athletes, 'SEED');

    expect(positions.get('entry-5')).toBe(1);
    expect(positions.get('entry-9')).toBe(2);
    expect(sortedPositions(positions)).toHaveLength(11);
  });

  it('closes gaps in seed numbers', () => {
    const athletes = createAthletes(Array(9).fill(null));
    athletes[0] = { ...(athletes[0] as DrawAthlete), seed: 2 };
    athletes[1] = { ...(athletes[1] as DrawAthlete), seed: 5 };

    const positions = assignDrawPositions(athletes, 'SEED');

    expect(positions.get('entry-0')).toBe(1);
    expect(positions.get('entry-1')).toBe(2);
  });

  it('gives each unseeded athlete a fair chance of each position', () => {
    const athletes = createAthletes(Array(9).fill(null));
    const seen = new Set<number>();

    for (let run = 0; run < 200; run += 1) {
      seen.add(assignDrawPositions(athletes, `run-${run}`).get('entry-0') ?? 0);
    }

    expect(seen.size).toBe(9);
  });
});

describe('club separation', () => {
  it.each([
    ['9 athletes', ['a', 'a', 'a', 'b', 'b', 'c', 'd', 'e', 'f']],
    ['11 athletes', ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'd', 'e']],
    ['16 athletes', ['a', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'd', 'd', 'e', 'f']],
  ])('finds no conflicts when avoidable, in many draws: %s', (_, clubs) => {
    const athletes = createAthletes(clubs);

    for (let run = 0; run < 100; run += 1) {
      const positions = assignDrawPositions(athletes, `run-${run}`);

      expect(findClubConflicts(athletes, positions)).toEqual([]);
    }
  });

  it('reports conflicts when they cannot be avoided', () => {
    const athletes = createAthletes(Array(16).fill('a'));
    const positions = assignDrawPositions(athletes, 'SEED');

    // Everyone is in one club, so all 8 first-round matches are within it.
    expect(findClubConflicts(athletes, positions)).toHaveLength(8);
  });

  it('never treats athletes with no club as clubmates', () => {
    const athletes = createAthletes(Array(16).fill(null));

    expect(findClubConflicts(athletes, assignDrawPositions(athletes, 'SEED'))).toEqual([]);
  });

  it('flags clubmates who both have byes and meet first in the next round', () => {
    // With 11 athletes, positions 4 and 5 both have byes and meet in the quarter-final.
    const athletes = createAthletes(Array(11).fill(null));
    athletes[0] = { ...(athletes[0] as DrawAthlete), clubId: 'a' };
    athletes[1] = { ...(athletes[1] as DrawAthlete), clubId: 'a' };
    const positions = new Map(athletes.map((athlete, index) => [athlete.entryId, index + 1]));
    positions.set('entry-0', 4);
    positions.set('entry-3', 1);
    positions.set('entry-1', 5);
    positions.set('entry-4', 2);

    expect(findClubConflicts(athletes, positions)).toEqual([['entry-0', 'entry-1']]);
  });

  it('does not flag a possible meeting that depends on a result', () => {
    // Position 1 has a bye and meets the winner of 8-9, so it isn't certain.
    const athletes = createAthletes(Array(9).fill(null));
    athletes[0] = { ...(athletes[0] as DrawAthlete), clubId: 'a' };
    athletes[7] = { ...(athletes[7] as DrawAthlete), clubId: 'a' };
    const positions = new Map(athletes.map((athlete, index) => [athlete.entryId, index + 1]));

    expect(findClubConflicts(athletes, positions)).toEqual([]);
  });

  it('keeps clubmates away from a bye meeting in many draws', () => {
    const athletes = createAthletes(['a', 'a', 'a', 'b', 'b', 'c', 'c', 'd', 'e', 'f', 'g']);

    for (let run = 0; run < 100; run += 1) {
      expect(findClubConflicts(athletes, assignDrawPositions(athletes, `run-${run}`))).toEqual([]);
    }
  });

  it('reports two clubmates who are the only athletes, because they must meet', () => {
    const athletes = createAthletes(['a', 'a']);

    expect(findClubConflicts(athletes, assignDrawPositions(athletes, 'SEED'))).toHaveLength(1);
  });

  it('leaves seeds out of the separation (FPJ Article 40.2)', () => {
    const athletes = createAthletes(Array(16).fill('a'));
    athletes[0] = { ...(athletes[0] as DrawAthlete), seed: 1 };
    const positions = assignDrawPositions(athletes, 'SEED');

    // The seed's match no longer counts, leaving 7 of the 8.
    expect(findClubConflicts(athletes, positions)).toHaveLength(7);
  });

  it('spreads a big club across the pools', () => {
    const clubs = ['a', 'a', 'a', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
    const athletes = createAthletes(clubs);
    const layout = [1, 16, 8, 9, 4, 13, 5, 12, 2, 15, 7, 10, 3, 14, 6, 11];
    const positions = assignDrawPositions(athletes, 'SEED');
    const pools = athletes
      .filter((athlete) => athlete.clubId === 'a')
      .map((athlete) => Math.floor(layout.indexOf(positions.get(athlete.entryId) ?? 0) / 4));

    expect(new Set(pools).size).toBe(4);
  });
});

describe('seededRandom', () => {
  it('repeats for the same seed', () => {
    const first = createSeededRandom('ABC');
    const second = createSeededRandom('ABC');

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('stays between 0 and 1', () => {
    const random = createSeededRandom('ABC');

    for (let run = 0; run < 1000; run += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('shuffles without losing or changing the original', () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffle(items, createSeededRandom('ABC'));

    expect(items).toEqual([1, 2, 3, 4, 5]);
    expect([...shuffled].sort()).toEqual(items);
  });

  it('creates readable 6-letter seeds without look-alike characters', () => {
    expect(createDrawSeed()).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
  });
});

describe('suggestFormat (FPJ Articles 38 and 39)', () => {
  it.each([
    [2, 'poule'],
    [5, 'poule'],
    [6, 'twoPoules'],
    [8, 'twoPoules'],
    [9, 'doubleRepechage'],
    [32, 'doubleRepechage'],
  ])('suggests for %i athletes: %s', (count, format) => {
    expect(suggestFormat(count)).toBe(format);
  });
});
