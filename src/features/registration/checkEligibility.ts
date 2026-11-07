/**
 * =====================================================
 * FILE: checkEligibility.ts
 * PURPOSE: Finds reasons an athlete may not fit a category.
 *          A pure function, so it's easy to test.
 * USED BY: AddAthletesContent.tsx, AthleteOptionRow.tsx,
 *          RegisteredAthleteRow.tsx
 * =====================================================
 */
import type { CategoryRules, EligibilityWarning, RegistrationAthlete } from './types';

/**
 * Compares an athlete with a category's rules. These are only warnings, because
 * FPJ Article 4 lets athletes compete outside their age class in some cases.
 * @param athlete the athlete's sex and birth year
 * @param category the category's sex and age limits, and the season year
 * @returns the reasons they may not fit, or an empty list if they fit
 * @example
 * // Born in 2012, in the 2026 season, so age 14 in a class starting at 15.
 * checkEligibility({ birthYear: 2012, sex: 'male' }, cadetes);
 * // [{ type: 'tooYoung', age: 14, minAge: 15 }]
 */
export function checkEligibility(
  athlete: Pick<RegistrationAthlete, 'birthYear' | 'sex'>,
  category: Pick<CategoryRules, 'sex' | 'minAge' | 'maxAge' | 'seasonYear'>,
): EligibilityWarning[] {
  const warnings: EligibilityWarning[] = [];

  if (category.sex !== 'mixed' && category.sex !== athlete.sex) {
    warnings.push({ type: 'sex' });
  }

  // 1. FPJ uses the age on 31 December, which is simply season minus birth year.
  //    That means it doesn't matter whether the birthday has happened yet.
  const age = category.seasonYear - athlete.birthYear;

  if (category.minAge !== null && age < category.minAge) {
    warnings.push({ type: 'tooYoung', age, minAge: category.minAge });
  }
  if (category.maxAge !== null && age > category.maxAge) {
    warnings.push({ type: 'tooOld', age, maxAge: category.maxAge });
  }

  return warnings;
}
