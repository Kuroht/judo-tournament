/**
 * =====================================================
 * FILE: filterCategories.ts
 * PURPOSE: Applies the search box to the categories list.
 *          A pure function, so it's easy to test.
 * USED BY: CategoriesScreen.tsx
 * =====================================================
 */
import { matchesSearch } from '@/lib/text/matchesSearch';

import type { CategoryListItem } from './types';

/**
 * Keeps the categories whose label or age class matches the search.
 * @param categories the full list
 * @param search typed text, ignoring accents
 * @returns the matching categories, in the same order
 */
export function filterCategories(
  categories: readonly CategoryListItem[],
  search: string,
): CategoryListItem[] {
  return categories.filter(
    (category) =>
      matchesSearch(category.label, search) || matchesSearch(category.ageClassName ?? '', search),
  );
}
