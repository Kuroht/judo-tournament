/**
 * =====================================================
 * FILE: useDrawSummaries.ts
 * PURPOSE: Gives a screen a tournament's categories with
 *          their draw states.
 * USED BY: DrawScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';
import type { LoadState } from '@/types/loadState';

import { listDrawSummaries } from '../db/drawQueries';
import type { DrawSummary } from '../types';

/** Reads the summaries. @returns the loading, error or ready state */
export function useDrawSummaries(tournamentId: string): LoadState<DrawSummary[]> {
  const query = useCallback(
    (db: SQLiteDatabase) => listDrawSummaries(db, tournamentId),
    [tournamentId],
  );

  return useFocusQuery(query);
}
