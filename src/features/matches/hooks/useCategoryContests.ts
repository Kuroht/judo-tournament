/**
 * =====================================================
 * FILE: useCategoryContests.ts
 * PURPOSE: Loads a category's contests.
 * USED BY: CategoryContestsScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useReloadableFocusQuery } from '@/hooks/useReloadableFocusQuery';

import { getCategoryContests } from '../db/contestQueries';

/**
 * Gives a screen a category's contests, reading them again each time it comes back
 * into view, so a match that has just finished shows straight away.
 * @param categoryId the category to show
 */
export function useCategoryContests(categoryId: string) {
  const query = useCallback(
    (database: SQLiteDatabase) => getCategoryContests(database, categoryId),
    [categoryId],
  );

  return useReloadableFocusQuery(query);
}
