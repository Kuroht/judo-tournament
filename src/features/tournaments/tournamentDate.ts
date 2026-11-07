/**
 * =====================================================
 * FILE: tournamentDate.ts
 * PURPOSE: Converts between the date shown to the trainer
 *          (31/12/2026) and the stored one (2026-12-31).
 * USED BY: validateTournamentForm.ts, useTournamentForm.ts,
 *          TournamentRow.tsx, TournamentOverviewScreen.tsx
 * =====================================================
 */

/**
 * Reads a typed date.
 * @param text the date as DD/MM/YYYY
 * @returns the stored form, or null if it isn't a real date
 * @example
 * parseDisplayDate('29/02/2028'); // "2028-02-29"
 * parseDisplayDate('31/02/2028'); // null
 */
export function parseDisplayDate(text: string): string | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (match === null) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  // 1. JavaScript quietly turns 31 February into 3 March. If the date we get back
  //    differs from what was typed, then what was typed doesn't exist.
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Formats a stored date for showing.
 * @param isoDate the date as YYYY-MM-DD
 * @returns the date as DD/MM/YYYY
 */
export function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');

  return `${day}/${month}/${year}`;
}

/**
 * Formats a real date for showing.
 * @param date the date, usually today
 * @returns the date as DD/MM/YYYY, using the tablet's own timezone
 */
export function toDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}/${month}/${date.getFullYear()}`;
}
