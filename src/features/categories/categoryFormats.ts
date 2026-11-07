/**
 * =====================================================
 * FILE: categoryFormats.ts
 * PURPOSE: The competition formats, and which text names
 *          each one.
 * USED BY: categoryQueries.ts, CategoryRow.tsx,
 *          CategoryFormFields.tsx, useCategoryForm.ts,
 *          and weigh-in through index.ts
 * =====================================================
 */
import type { TranslationKey } from '@/lib/i18n/pt';

import type { CategoryFormat } from './types';

// FPJ Article 39: competitions with more than 8 athletes use double repechage.
export const DEFAULT_CATEGORY_FORMAT: CategoryFormat = 'doubleRepechage';

// A free group is usually small, so everyone fighting everyone suits it best.
export const FREE_GROUP_FORMAT: CategoryFormat = 'poule';

export const CATEGORY_FORMAT_LABELS: Record<CategoryFormat, TranslationKey> = {
  doubleRepechage: 'categories.format.doubleRepechage',
  quarterFinalRepechage: 'categories.format.quarterFinalRepechage',
  poule: 'categories.format.poule',
  twoPoules: 'categories.format.twoPoules',
  directKnockout: 'categories.format.directKnockout',
};

/** Checks if text is a valid format, for narrowing a SelectField's string value. */
export function isCategoryFormat(value: string): value is CategoryFormat {
  return value in CATEGORY_FORMAT_LABELS;
}
