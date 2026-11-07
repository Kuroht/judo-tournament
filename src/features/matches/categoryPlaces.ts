/**
 * =====================================================
 * FILE: categoryPlaces.ts
 * PURPOSE: Works out who finished where in a category.
 *          Pure functions, so they're easy to test.
 * USED BY: buildCategoryContests.ts
 * =====================================================
 */
import type { BracketPlaces } from '@/lib/brackets/resolveBracket';

import type { Contest, ContestPlace } from './types';

/** Turns the bracket's places into a list, best first. */
export function fromBracketPlaces(places: BracketPlaces): ContestPlace[] {
  return [
    ...places.first.map((position) => ({ position, place: 1 })),
    ...places.second.map((position) => ({ position, place: 2 })),
    ...places.third.map((position) => ({ position, place: 3 })),
    ...places.fifth.map((position) => ({ position, place: 5 })),
  ];
}

/**
 * Turns a poule's final order into places.
 * @param order the positions, best first, or null if it isn't decided yet
 * @param tiedGroups athletes who share a place, because their tie decides nothing
 */
export function fromPouleOrder(
  order: readonly number[] | null,
  tiedGroups: readonly (readonly number[])[],
): ContestPlace[] {
  const finalOrder = order ?? [];

  return finalOrder.map((position) => {
    const group = tiedGroups.find((tied) => tied.includes(position)) ?? [position];
    const bestIndex = Math.min(...group.map((member) => finalOrder.indexOf(member)));

    return { position, place: bestIndex + 1 };
  });
}

/** Finds a finished contest's two athletes, with the winner first. */
function winnerThenLoser(contest: Contest): [number | null, number | null] {
  const white = contest.white?.position ?? null;
  const blue = contest.blue?.position ?? null;

  return contest.winnerEntryId === contest.white?.entryId ? [white, blue] : [blue, white];
}

/**
 * Works out the places after two poules. The semifinal losers finish 3rd, because there
 * are no bronze contests (FPJ Article 38). If both athletes lose a contest, they finish
 * 2nd in the final, and 5th in a semifinal (Article 45.3).
 * @param finals the crossed semifinals and the final
 * @param byeFinalists athletes who reached the final with no semifinal to fight
 * @returns the places, best first
 */
export function getTwoPoulesPlaces(
  finals: readonly Contest[],
  byeFinalists: readonly number[],
): ContestPlace[] {
  const places: ContestPlace[] = [];
  const add = (position: number | null, place: number) => {
    if (position !== null) {
      places.push({ position, place });
    }
  };
  const final = finals.find((contest) => contest.part === 'final');
  const finishedSemiFinals = finals.filter(
    (contest) => contest.part === 'semiFinal' && contest.isFinished,
  );
  const finalists: (number | null)[] = [...byeFinalists];

  if (final?.isFinished) {
    const [winner, loser] = winnerThenLoser(final);
    add(winner, final.winnerEntryId === null ? 2 : 1);
    add(loser, 2);
  }

  for (const semiFinal of finishedSemiFinals) {
    const [winner, loser] = winnerThenLoser(semiFinal);

    if (semiFinal.winnerEntryId === null) {
      add(winner, 5);
      add(loser, 5);
      continue;
    }

    finalists.push(winner);
    // FPJ Article 43.2: an athlete who didn't turn up can't take a medal.
    add(semiFinal.resultType === 'fusenGachi' ? null : loser, 3);
  }

  // If both athletes lost the other semifinal, this finalist has no final to fight.
  if (final === undefined && finalists.length === 1) {
    add(finalists[0] ?? null, 1);
  }

  return places.sort((first, second) => first.place - second.place);
}
