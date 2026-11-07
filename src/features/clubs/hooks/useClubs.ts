/**
 * =====================================================
 * FILE: useClubs.ts
 * PURPOSE: Gives a screen the list of clubs.
 * USED BY: ClubsScreen.tsx, and athletes through index.ts
 * =====================================================
 */
import { useFocusQuery } from '@/hooks/useFocusQuery';
import type { LoadState } from '@/types/loadState';

import { listClubs } from '../db/clubQueries';
import type { ClubListItem } from '../types';

/** Reads the clubs. @returns the loading, error or ready state */
export function useClubs(): LoadState<ClubListItem[]> {
  return useFocusQuery(listClubs);
}
