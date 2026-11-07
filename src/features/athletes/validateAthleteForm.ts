/**
 * =====================================================
 * FILE: validateAthleteForm.ts
 * PURPOSE: Checks the athlete form and turns its text into
 *          clean data. A pure function, so it's easy to test.
 * USED BY: useAthleteForm.ts
 * =====================================================
 */
import type { AthleteData, AthleteFormValues } from './types';

export const MIN_BIRTH_YEAR = 1900;

export type AthleteFormErrors = {
  name?: true;
  birthYear?: true;
  sex?: true;
};

export type AthleteValidation =
  | { type: 'valid'; data: AthleteData }
  | { type: 'invalid'; errors: AthleteFormErrors };

/** Trims text, and turns empty text into null for optional database columns. */
function emptyToNull(text: string): string | null {
  const trimmed = text.trim();

  return trimmed === '' ? null : trimmed;
}

/**
 * Validates what was typed into the athlete form.
 * @param values the form's current values
 * @param currentYear passed in rather than read from the clock, so tests stay stable
 * @returns the clean data, or which fields are wrong
 * @example
 * validateAthleteForm({ ...values, birthYear: '12' }, 2026);
 * // { type: 'invalid', errors: { birthYear: true } }
 */
export function validateAthleteForm(
  values: AthleteFormValues,
  currentYear: number,
): AthleteValidation {
  const name = values.name.trim();
  const birthYearText = values.birthYear.trim();
  const birthYear = Number(birthYearText);
  const isBirthYearValid =
    /^\d{4}$/.test(birthYearText) && birthYear >= MIN_BIRTH_YEAR && birthYear <= currentYear;

  // Comparing with null here lets TypeScript know sex is set in the valid branch.
  if (name !== '' && isBirthYearValid && values.sex !== null) {
    return {
      type: 'valid',
      data: {
        name,
        birthYear,
        sex: values.sex,
        clubId: values.clubId,
        belt: emptyToNull(values.belt),
        notes: emptyToNull(values.notes),
      },
    };
  }

  const errors: AthleteFormErrors = {};
  if (name === '') {
    errors.name = true;
  }
  if (!isBirthYearValid) {
    errors.birthYear = true;
  }
  if (values.sex === null) {
    errors.sex = true;
  }

  return { type: 'invalid', errors };
}
