/**
 * =====================================================
 * FILE: useAthletes.ts
 * PURPOSE: Gives a screen the list of athletes.
 * USED BY: AthletesScreen.tsx
 * =====================================================
 */
import { useFocusQuery } from '@/hooks/useFocusQuery';
import type { LoadState } from '@/types/loadState';

import { listAthletes } from '../db/athleteQueries';
import type { AthleteListItem } from '../types';

/** Reads the athletes. @returns the loading, error or ready state */
export function useAthletes(): LoadState<AthleteListItem[]> {
  return useFocusQuery(listAthletes);
}
