/**
 * =====================================================
 * FILE: assignDrawPositions.ts
 * PURPOSE: The draw: gives each athlete a position, keeping
 *          athletes from the same club apart where possible.
 * USED BY: useCategoryDraw.ts, DrawResult.tsx,
 *          assignPoulePositions.ts
 * =====================================================
 */
import { getBracketLayout, getBracketSize, getPoolAt } from './bracketLayout';
import { createSeededRandom, shuffle } from './seededRandom';

export type DrawAthlete = {
  entryId: string;
  clubId: string | null;
  // The seed number, or null if unseeded.
  seed: number | null;
};

type SheetPlace = {
  pool: string;
  // Everyone who could be this position's first opponent. With one, the meeting is certain.
  firstOpponents: number[];
};

/**
 * Finds each position's pool and possible first opponents. A position with a bye
 * has its first contest in a later round, so we look further along the sheet until
 * the neighbouring part of it has somebody in it.
 */
function describeSheet(athleteCount: number): Map<number, SheetPlace> {
  const layout = getBracketLayout(getBracketSize(athleteCount));
  const places = new Map<number, SheetPlace>();

  layout.forEach((position, index) => {
    let firstOpponents: number[] = [];

    for (let blockSize = 1; blockSize < layout.length && firstOpponents.length === 0; blockSize *= 2) {
      const myBlock = Math.floor(index / blockSize);
      const neighbourBlock = myBlock % 2 === 0 ? myBlock + 1 : myBlock - 1;
      firstOpponents = layout
        .slice(neighbourBlock * blockSize, (neighbourBlock + 1) * blockSize)
        .filter((other) => other <= athleteCount);
    }

    places.set(position, { pool: getPoolAt(index, layout.length), firstOpponents });
  });

  return places;
}

/**
 * Finds certain first meetings between athletes of the same club, including those
 * after a bye. Seeds don't count, because FPJ Article 40.2 leaves them out.
 * @param athletes the athletes in the draw
 * @param positions each athlete's position, by entry id
 * @returns the pairs of entry ids
 */
export function findClubConflicts(
  athletes: readonly DrawAthlete[],
  positions: ReadonlyMap<string, number>,
): [string, string][] {
  const places = describeSheet(athletes.length);
  const byPosition = new Map(athletes.map((athlete) => [positions.get(athlete.entryId), athlete]));
  const conflicts: [string, string][] = [];

  for (const athlete of athletes) {
    const position = positions.get(athlete.entryId) ?? 0;
    const opponents = places.get(position)?.firstOpponents ?? [];
    const opponentPosition = opponents.length === 1 ? (opponents[0] ?? 0) : 0;
    const opponent = byPosition.get(opponentPosition);

    // A meeting only counts as certain if each is the other's only possible opponent.
    const isMutual = places.get(opponentPosition)?.firstOpponents.length === 1;
    const isSameClub =
      opponent !== undefined &&
      isMutual &&
      athlete.clubId !== null &&
      athlete.clubId === opponent.clubId &&
      athlete.seed === null &&
      opponent.seed === null;

    // Each pair is met twice, once from each side, so only keep the first.
    if (isSameClub && opponent !== undefined && position < opponentPosition) {
      conflicts.push([athlete.entryId, opponent.entryId]);
    }
  }

  return conflicts;
}

/**
 * Sets the order athletes are placed in, for elimination and poule draws alike.
 * @param athletes the athletes in the draw
 * @param random a generator from createSeededRandom
 * @returns the seeds in order, and the others in the order to place them
 */
export function orderForPlacement(athletes: readonly DrawAthlete[], random: () => number) {
  // 1. Sort by id first, so that the order the database returns can't change the draw.
  //    A plain comparison, because localeCompare can differ between devices.
  const sorted = [...athletes].sort((a, b) => (a.entryId < b.entryId ? -1 : 1));
  const seeded = sorted
    .filter((athlete) => athlete.seed !== null)
    .sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0));

  // 2. Biggest clubs go first, because they're the hardest to keep apart.
  //    Equal sizes keep their shuffled order, which is what the index is for.
  const unseeded = shuffle(
    sorted.filter((athlete) => athlete.seed === null),
    random,
  );
  const clubSize = (clubId: string | null) =>
    clubId === null ? 0 : unseeded.filter((athlete) => athlete.clubId === clubId).length;
  const order = unseeded
    .map((athlete, index) => ({ athlete, index }))
    .sort((a, b) => clubSize(b.athlete.clubId) - clubSize(a.athlete.clubId) || a.index - b.index)
    .map(({ athlete }) => athlete);

  return { seeded, order };
}

/**
 * Runs the draw for an elimination bracket. The same athletes, seeds and code always
 * give the same draw.
 * @param athletes the athletes in the draw
 * @param seed the text the random numbers start from
 * @returns each athlete's position from 1 upward, by entry id. Seeds take the lowest
 *          positions, which also gives them the byes.
 */
export function assignDrawPositions(
  athletes: readonly DrawAthlete[],
  seed: string,
): Map<string, number> {
  const random = createSeededRandom(seed);
  const places = describeSheet(athletes.length);
  const positions = new Map<string, number>();
  const { seeded, order } = orderForPlacement(athletes, random);

  seeded.forEach((athlete, index) => positions.set(athlete.entryId, index + 1));

  let freePositions = shuffle(
    Array.from({ length: order.length }, (_, index) => seeded.length + index + 1),
    random,
  );
  const clubOf = new Map<number, string>();

  for (const athlete of order) {
    // 3. Prefer no clubmate as a first opponent, then the fewest clubmates in the
    //    pool. The list is shuffled, so ties are settled at random.
    let best = freePositions[0] ?? 0;
    let bestPenalty = Infinity;

    for (const position of freePositions) {
      const place = places.get(position);
      const opponents = place?.firstOpponents ?? [];
      const hasClubmateOpponent = opponents.some(
        (other) => athlete.clubId !== null && clubOf.get(other) === athlete.clubId,
      );
      const clubmatesInPool = [...clubOf].filter(
        ([other, club]) => club === athlete.clubId && places.get(other)?.pool === place?.pool,
      ).length;
      const penalty = (hasClubmateOpponent ? 1000 : 0) + clubmatesInPool;

      if (penalty < bestPenalty) {
        best = position;
        bestPenalty = penalty;
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
