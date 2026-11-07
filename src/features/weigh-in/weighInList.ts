/**
 * =====================================================
 * FILE: weighInList.ts
 * PURPOSE: Orders and filters the weigh-in list. Pure
 *          functions, so they're easy to test.
 * USED BY: weighInQueries.ts, WeighInContent.tsx
 * =====================================================
 */
import { matchesSearch } from '@/lib/text/matchesSearch';

import type { WeighInEntry } from './types';

export const ALL_CATEGORIES = 'all';

/**
 * Orders entries within their categories. Entries must arrive in category order.
 * Free groups are sorted by weight, because that's how the trainer forms groups
 * from them. All other categories are sorted by name.
 * @returns a new sorted list
 */
export function sortWeighInEntries(entries: readonly WeighInEntry[]): WeighInEntry[] {
  // 1. Remember the order each category first appeared in.
  const categoryOrder = new Map<string, number>();
  for (const entry of entries) {
    if (!categoryOrder.has(entry.categoryId)) {
      categoryOrder.set(entry.categoryId, categoryOrder.size);
    }
  }

  return [...entries].sort((a, b) => {
    const categoryDifference =
      (categoryOrder.get(a.categoryId) ?? 0) - (categoryOrder.get(b.categoryId) ?? 0);
    if (categoryDifference !== 0) {
      return categoryDifference;
    }

    // 2. Athletes without a weight yet go last in a free group.
    if (a.isFreeGrouping) {
      const weightDifference = (a.weighedKg ?? Infinity) - (b.weighedKg ?? Infinity);
      if (weightDifference !== 0 && !Number.isNaN(weightDifference)) {
        return weightDifference;
      }
    }

    return a.name.localeCompare(b.name, 'pt');
  });
}

/**
 * Keeps the entries that match the current filters.
 * @param entries the full list
 * @param search typed text, matched on the name or club and ignoring accents
 * @param categoryFilter ALL_CATEGORIES or a category id
 * @param isPendingOnly true to hide athletes who have already been dealt with
 * @returns the matching entries, in the same order
 */
export function filterWeighInEntries(
  entries: readonly WeighInEntry[],
  search: string,
  categoryFilter: string,
  isPendingOnly: boolean,
): WeighInEntry[] {
  return entries.filter((entry) => {
    if (isPendingOnly && entry.status !== 'registered') {
      return false;
    }
    if (categoryFilter !== ALL_CATEGORIES && entry.categoryId !== categoryFilter) {
      return false;
    }

    return matchesSearch(entry.name, search) || matchesSearch(entry.clubName ?? '', search);
  });
}

/**
 * Finds who to weigh next, so the trainer doesn't have to go back to the list.
 * @param entries the visible list
 * @param currentEntryId the athlete who was just weighed
 * @returns the next athlete still to be weighed, wrapping round to the top of the
 *          list, or null if everyone is done
 */
export function findNextPendingEntry(
  entries: readonly WeighInEntry[],
  currentEntryId: string,
): WeighInEntry | null {
  const currentIndex = entries.findIndex((entry) => entry.entryId === currentEntryId);
  const rotated = [...entries.slice(currentIndex + 1), ...entries.slice(0, currentIndex + 1)];
  const next = rotated.find(
    (entry) => entry.status === 'registered' && entry.entryId !== currentEntryId,
  );

  return next ?? null;
}
