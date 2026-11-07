/**
 * =====================================================
 * FILE: seededRandom.ts
 * PURPOSE: Random numbers that repeat for the same seed, so
 *          a draw can be reproduced and shown to coaches.
 * USED BY: assignDrawPositions.ts, useCategoryDraw.ts
 * =====================================================
 */

const SEED_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SEED_LENGTH = 6;

/**
 * Creates a short seed that's easy to read aloud. It leaves out letters that
 * look alike, such as O and 0, or I and 1.
 * @example
 * createDrawSeed(); // "K7QM2X"
 */
export function createDrawSeed(): string {
  let seed = '';
  for (let index = 0; index < SEED_LENGTH; index += 1) {
    seed += SEED_LETTERS.charAt(Math.floor(Math.random() * SEED_LETTERS.length));
  }

  return seed;
}

/**
 * Creates a random number generator from a seed.
 * @param seed any text. The same text always gives the same numbers.
 * @returns a function giving numbers from 0 up to, but not including, 1
 */
export function createSeededRandom(seed: string): () => number {
  // 1. Turn the text into a single number (the FNV-1a hash).
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state = Math.imul(state ^ seed.charCodeAt(index), 16777619);
  }

  // 2. Each call scrambles that number into the next one (the Mulberry32 method).
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles a list fairly, using the Fisher-Yates method.
 * @param items the list, which is left unchanged
 * @param random a generator from createSeededRandom
 * @returns a new shuffled list
 */
export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    const current = shuffled[index] as T;
    shuffled[index] = shuffled[other] as T;
    shuffled[other] = current;
  }

  return shuffled;
}
