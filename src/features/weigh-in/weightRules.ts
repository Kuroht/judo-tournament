/**
 * =====================================================
 * FILE: weightRules.ts
 * PURPOSE: The rules for deciding whether a weight fits a
 *          category. Pure functions, so they're easy to test.
 * USED BY: weighInQueries.ts, useWeighIn.ts,
 *          useWeighInText.ts, WeighMoveOptions.tsx,
 *          WeightInput.tsx
 * =====================================================
 */
import type {
  EntryStatus,
  WeighInCategory,
  WeighInEntry,
  WeightLimits,
  WeightResult,
} from './types';

const MIN_WEIGHT_KG = 5;
const MAX_WEIGHT_KG = 300;

// Comparing whole grams avoids decimal errors, because in JavaScript
// 60 + 0.2 is 60.2 but numbers like 0.1 + 0.2 are not exactly 0.3.
function toGrams(kg: number): number {
  return Math.round(kg * 1000);
}

/**
 * Reads a typed weight. Portuguese keyboards type a comma for decimals.
 * @param text what was typed
 * @returns the weight in kg, or null if it isn't a believable weight
 * @example
 * parseWeightInput('60,5'); // 60.5
 * parseWeightInput('605'); // null, because a person can't weigh 605 kg
 */
export function parseWeightInput(text: string): number | null {
  const cleaned = text.trim().replace(',', '.');

  if (!/^\d{1,3}(\.\d{1,3})?$/.test(cleaned)) {
    return null;
  }

  const kg = Number(cleaned);

  return kg >= MIN_WEIGHT_KG && kg <= MAX_WEIGHT_KG ? kg : null;
}

/**
 * Checks a weight against a category's limits.
 * @param kg the weight on the scale
 * @param limits the category's limits and tolerance
 * @returns 'pass', 'over' or 'under'
 * @example
 * // FPJ Article 17: the 200 g tolerance includes exactly 200 g.
 * evaluateWeight(60.2, { minKg: 55, maxKg: 60, isFreeGrouping: false, toleranceGrams: 200 }); // 'pass'
 * // -66 means above 60, so exactly 60 belongs in -60.
 * evaluateWeight(60, { minKg: 60, maxKg: 66, isFreeGrouping: false, toleranceGrams: 0 }); // 'under'
 */
export function evaluateWeight(kg: number, limits: WeightLimits): WeightResult {
  if (limits.isFreeGrouping) {
    return 'pass';
  }

  const grams = toGrams(kg);

  // 1. The tolerance only forgives being over, and never being under.
  if (limits.maxKg !== null && grams > toGrams(limits.maxKg) + limits.toleranceGrams) {
    return 'over';
  }
  if (limits.minKg !== null && grams <= toGrams(limits.minKg)) {
    return 'under';
  }

  return 'pass';
}

/**
 * Works out pass or fail from the category's current limits. The saved status could
 * be out of date, because the trainer can edit a category's limits after the weigh-in.
 * @param status the saved status
 * @param weighedKg the saved weight, if any
 * @param limits the category's current limits
 * @returns the status to use. Only passed and failed can change.
 */
export function getCurrentStatus(
  status: EntryStatus,
  weighedKg: number | null,
  limits: WeightLimits,
): EntryStatus {
  if (weighedKg === null || (status !== 'passed' && status !== 'failed')) {
    return status;
  }

  return evaluateWeight(weighedKg, limits) === 'pass' ? 'passed' : 'failed';
}

/**
 * Finds the category this weight belongs in, within the same age class and sex.
 * @param categories the tournament's categories, lightest first
 * @param entry the athlete's current registration
 * @param kg the weight on the scale
 * @returns the lightest category that fits, or null if the tournament has none
 */
export function findCorrectCategory(
  categories: readonly WeighInCategory[],
  entry: WeighInEntry,
  kg: number,
): WeighInCategory | null {
  const match = categories.find(
    (category) =>
      category.id !== entry.categoryId &&
      !category.isFreeGrouping &&
      category.ageClassId === entry.ageClassId &&
      category.sex === entry.categorySex &&
      evaluateWeight(kg, category) === 'pass',
  );

  return match ?? null;
}

/**
 * Formats a weight for showing.
 * @param kg the weight
 * @param language decides between a decimal comma and a decimal point
 * @example
 * formatKg(60.5, 'pt'); // "60,5"
 */
export function formatKg(kg: number, language: 'pt' | 'en'): string {
  return language === 'pt' ? String(kg).replace('.', ',') : String(kg);
}
