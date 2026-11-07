/**
 * =====================================================
 * FILE: useCategories.ts
 * PURPOSE: Gives a screen the categories of a tournament.
 * USED BY: CategoriesScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';
import type { LoadState } from '@/types/loadState';

import { listCategories } from '../db/categoryQueries';
import type { CategoryListItem } from '../types';

/** Reads the categories. @returns the loading, error or ready state */
export function useCategories(tournamentId: string): LoadState<CategoryListItem[]> {
  const query = useCallback(
    (db: SQLiteDatabase) => listCategories(db, tournamentId),
    [tournamentId],
  );

  return useFocusQuery(query);
}
