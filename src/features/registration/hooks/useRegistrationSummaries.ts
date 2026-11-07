/**
 * =====================================================
 * FILE: useRegistrationSummaries.ts
 * PURPOSE: Gives a screen a tournament's categories with
 *          their registration counts.
 * USED BY: RegistrationScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';
import type { LoadState } from '@/types/loadState';

import { listRegistrationSummaries } from '../db/registrationQueries';
import type { RegistrationSummary } from '../types';

/** Reads the summaries. @returns the loading, error or ready state */
export function useRegistrationSummaries(tournamentId: string): LoadState<RegistrationSummary[]> {
  const query = useCallback(
    (db: SQLiteDatabase) => listRegistrationSummaries(db, tournamentId),
    [tournamentId],
  );

  return useFocusQuery(query);
}
