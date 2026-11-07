/**
 * =====================================================
 * FILE: validateRulePreset.ts
 * PURPOSE: Checks a season year and an age class's rules
 *          before they are saved. Pure functions, so they're
 *          easy to test.
 * USED BY: useSeasonYear.ts, useRulePresetForm.ts
 * =====================================================
 */
import type { RulePresetFormValues, RulePresetRules } from './types';

const MIN_SEASON_YEAR = 2000;
const MAX_SEASON_YEAR = 2100;
const MIN_MATCH_SECONDS = 30;
const MAX_MATCH_SECONDS = 1200;
const MAX_GOLDEN_SCORE_SECONDS = 1200;
const MAX_TOLERANCE_GRAMS = 5000;

export type RulePresetErrors = Partial<
  Record<'matchSeconds' | 'goldenScoreMaxSeconds' | 'weightToleranceGrams', true>
>;

/** Reads whole-number text. @returns the number, or null if it isn't one */
function parseWholeNumber(text: string): number | null {
  const trimmed = text.trim();

  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

/**
 * Checks a season year.
 * @returns the year, or null if it isn't valid
 */
export function parseSeasonYear(text: string): number | null {
  const year = parseWholeNumber(text);

  return year !== null && year >= MIN_SEASON_YEAR && year <= MAX_SEASON_YEAR ? year : null;
}

/**
 * Checks an age class's rules.
 * @param values what was typed
 * @returns the rules to save, or which fields are wrong
 */
export function validateRulePreset(
  values: RulePresetFormValues,
): { rules: RulePresetRules } | { errors: RulePresetErrors } {
  const errors: RulePresetErrors = {};

  const matchSeconds = parseWholeNumber(values.matchSeconds);
  if (
    matchSeconds === null ||
    matchSeconds < MIN_MATCH_SECONDS ||
    matchSeconds > MAX_MATCH_SECONDS
  ) {
    errors.matchSeconds = true;
  }

  // Empty means golden score has no time limit.
  const isUnlimited = !values.hasGoldenScore || values.goldenScoreMaxSeconds.trim() === '';
  const goldenScoreMax = isUnlimited ? null : parseWholeNumber(values.goldenScoreMaxSeconds);
  const isGoldenScoreMaxBad =
    !isUnlimited &&
    (goldenScoreMax === null || goldenScoreMax < 1 || goldenScoreMax > MAX_GOLDEN_SCORE_SECONDS);
  if (isGoldenScoreMaxBad) {
    errors.goldenScoreMaxSeconds = true;
  }

  const tolerance = parseWholeNumber(values.weightToleranceGrams);
  if (tolerance === null || tolerance > MAX_TOLERANCE_GRAMS) {
    errors.weightToleranceGrams = true;
  }

  if (Object.keys(errors).length > 0 || matchSeconds === null || tolerance === null) {
    return { errors };
  }

  return {
    rules: {
      matchSeconds,
      hasGoldenScore: values.hasGoldenScore,
      goldenScoreMaxSeconds: goldenScoreMax,
      isYukoEnabled: values.isYukoEnabled,
      weightToleranceGrams: tolerance,
    },
  };
}
