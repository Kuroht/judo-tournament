/**
 * =====================================================
 * FILE: useAthleteHistory.ts
 * PURPOSE: Loads one athlete's history.
 * USED BY: AthleteHistoryScreen.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { useCallback } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';

import { getAthleteHistory } from '../db/historyQueries';

/**
 * Gives a screen an athlete's history.
 * @param athleteId the athlete to show
 */
export function useAthleteHistory(athleteId: string) {
  const query = useCallback((db: SQLiteDatabase) => getAthleteHistory(db, athleteId), [athleteId]);

  return useFocusQuery(query);
}
