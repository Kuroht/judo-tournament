/**
 * =====================================================
 * FILE: createId.ts
 * PURPOSE: Creates ids for new database rows.
 * USED BY: every feature's db/ folder, from step 3 onward
 * =====================================================
 */

/**
 * Creates a text id that is safe to merge between devices.
 * It combines the time with randomness, so two devices are very unlikely to
 * create the same id. It isn't suitable for secrets, but ids aren't secret.
 * @returns a new id
 * @example
 * createId(); // "mhq2v8k1-x7f3k2a9"
 */
export function createId(): string {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `${timePart}-${randomPart}`;
}
