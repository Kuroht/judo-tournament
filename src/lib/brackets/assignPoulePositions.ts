/**
 * =====================================================
 * FILE: assignPoulePositions.ts
 * PURPOSE: The draw for poules: gives each athlete a
 *          position, spreading clubs across two poules.
 * USED BY: useCategoryDraw.ts
 * =====================================================
 */
import { orderForPlacement, type DrawAthlete } from './assignDrawPositions';
import { createSeededRandom, shuffle } from './seededRandom';

/**
 * Runs a poule draw. The same athletes, seeds and code always give the same draw.
 * @param athletes the athletes in the draw
 * @param seed the text the random numbers start from
 * @param pouleCount 1 for one poule, or 2 for two, where odd positions make up
 *                   poule A and even positions make up poule B
 * @returns each athlete's position from 1 upward, by entry id
 */
export function assignPoulePositions(
  athletes: readonly DrawAthlete[],
  seed: string,
  pouleCount: 1 | 2,
): Map<string, number> {
  const random = createSeededRandom(seed);
  const { seeded, order } = orderForPlacement(athletes, random);
  const positions = new Map<string, number>();

  seeded.forEach((athlete, index) => positions.set(athlete.entryId, index + 1));

  let freePositions = shuffle(
    Array.from({ length: order.length }, (_, index) => seeded.length + index + 1),
    random,
  );
  const clubOf = new Map<number, string>();
  const pouleOf = (position: number) => (pouleCount === 1 ? 0 : (position - 1) % 2);

  for (const athlete of order) {
    // Choose the poule with the fewest clubmates. The list is shuffled, so ties are random.
    let best = freePositions[0] ?? 0;
    let bestCount = Infinity;

    for (const position of freePositions) {
      const clubmates = [...clubOf].filter(
        ([other, club]) => club === athlete.clubId && pouleOf(other) === pouleOf(position),
      ).length;

      if (clubmates < bestCount) {
        best = position;
        bestCount = clubmates;
      }
    }

    positions.set(athlete.entryId, best);
    freePositions = freePositions.filter((position) => position !== best);
    if (athlete.clubId !== null) {
      clubOf.set(best, athlete.clubId);
    }
  }

  return positions;
}
