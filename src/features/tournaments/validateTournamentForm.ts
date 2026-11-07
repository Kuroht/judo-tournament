/**
 * =====================================================
 * FILE: validateTournamentForm.ts
 * PURPOSE: Checks the tournament form and turns its text
 *          into clean data. A pure function, so it's easy
 *          to test.
 * USED BY: useTournamentForm.ts
 * =====================================================
 */
import { parseDisplayDate } from './tournamentDate';
import type { TournamentData, TournamentFormValues } from './types';

export const MIN_SEASON_YEAR = 2000;
export const MAX_SEASON_YEAR = 2100;

export type TournamentFormErrors = {
  name?: true;
  date?: true;
  seasonYear?: true;
};

export type TournamentValidation =
  | { type: 'valid'; data: TournamentData }
  | { type: 'invalid'; errors: TournamentFormErrors };

/**
 * Validates what was typed into the tournament form.
 * @param values the form's current values
 * @returns the clean data, or which fields are wrong
 * @example
 * validateTournamentForm({ ...values, date: '31/02/2026' });
 * // { type: 'invalid', errors: { date: true } }
 */
export function validateTournamentForm(values: TournamentFormValues): TournamentValidation {
  const name = values.name.trim();
  const place = values.place.trim();
  const date = parseDisplayDate(values.date);
  const seasonYearText = values.seasonYear.trim();
  const seasonYear = Number(seasonYearText);
  const isSeasonYearValid =
    /^\d{4}$/.test(seasonYearText) && seasonYear >= MIN_SEASON_YEAR && seasonYear <= MAX_SEASON_YEAR;

  if (name !== '' && date !== null && isSeasonYearValid) {
    return {
      type: 'valid',
      data: { name, date, place: place === '' ? null : place, seasonYear },
    };
  }

  const errors: TournamentFormErrors = {};
  if (name === '') {
    errors.name = true;
  }
  if (date === null) {
    errors.date = true;
  }
  if (!isSeasonYearValid) {
    errors.seasonYear = true;
  }

  return { type: 'invalid', errors };
}
