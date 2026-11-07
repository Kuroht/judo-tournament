/**
 * =====================================================
 * FILE: validateCategoryForm.ts
 * PURPOSE: Checks the category form and turns its text into
 *          clean data. A pure function, so it's easy to test.
 * USED BY: useCategoryForm.ts
 * =====================================================
 */
import type { CategoryData, CategoryFormValues } from './types';

export type CategoryFormErrors = {
  label?: true;
  minKg?: true;
  maxKg?: true;
  range?: true;
};

export type CategoryValidation =
  | { type: 'valid'; data: CategoryData }
  | { type: 'invalid'; errors: CategoryFormErrors };

type ParsedKg = { isValid: true; value: number | null } | { isValid: false };

/**
 * Reads a weight typed by the trainer. Portuguese keyboards type a comma for
 * decimals, so both "60,5" and "60.5" are accepted. Empty means no limit.
 */
function parseKg(text: string): ParsedKg {
  const cleaned = text.trim().replace(',', '.');

  if (cleaned === '') {
    return { isValid: true, value: null };
  }
  if (!/^\d+(\.\d+)?$/.test(cleaned) || Number(cleaned) <= 0) {
    return { isValid: false };
  }

  return { isValid: true, value: Number(cleaned) };
}

/**
 * Validates what was typed into the category form.
 * @param values the form's current values
 * @returns the clean data, or which fields are wrong
 * @example
 * validateCategoryForm({ ...values, minKg: '66', maxKg: '60' });
 * // { type: 'invalid', errors: { range: true } }
 */
export function validateCategoryForm(values: CategoryFormValues): CategoryValidation {
  const label = values.label.trim();
  const errors: CategoryFormErrors = {};

  if (label === '') {
    errors.label = true;
  }

  // 1. A free group has no limits, because athletes are grouped after the weigh-in.
  const minKg = values.isFreeGrouping ? parseKg('') : parseKg(values.minKg);
  const maxKg = values.isFreeGrouping ? parseKg('') : parseKg(values.maxKg);

  if (!minKg.isValid) {
    errors.minKg = true;
  }
  if (!maxKg.isValid) {
    errors.maxKg = true;
  }

  if (minKg.isValid && maxKg.isValid && label !== '') {
    if (minKg.value !== null && maxKg.value !== null && minKg.value >= maxKg.value) {
      return { type: 'invalid', errors: { range: true } };
    }

    return {
      type: 'valid',
      data: {
        ageClassId: values.ageClassId,
        sex: values.sex,
        label,
        minKg: minKg.value,
        maxKg: maxKg.value,
        format: values.format,
        isFreeGrouping: values.isFreeGrouping,
      },
    };
  }

  return { type: 'invalid', errors };
}
