/**
 * =====================================================
 * FILE: useTournaments.ts
 * PURPOSE: Gives a screen the list of tournaments.
 * USED BY: TournamentsScreen.tsx
 * =====================================================
 */
import { useFocusQuery } from '@/hooks/useFocusQuery';
import type { LoadState } from '@/types/loadState';

import { listTournaments } from '../db/tournamentQueries';
import type { Tournament } from '../types';

/** Reads the tournaments. @returns the loading, error or ready state */
export function useTournaments(): LoadState<Tournament[]> {
  return useFocusQuery(listTournaments);
}
