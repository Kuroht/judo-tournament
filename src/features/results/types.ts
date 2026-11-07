/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the results feature.
 * USED BY: the results feature
 * =====================================================
 */
import type { ContestAthlete } from '@/features/matches';
import type { ResultType } from '@/lib/rules/types';

export type PlacedAthlete = {
  place: number;
  athlete: ContestAthlete;
};

/** How a category stands. Places are only shown once all its contests have finished. */
export type CategoryResult = {
  categoryId: string;
  title: string;
  isComplete: boolean;
  finishedCount: number;
  totalCount: number;
  placed: PlacedAthlete[];
};

/** One club's line in the medal table. */
export type MedalRow = {
  // Null for athletes with no club.
  clubId: string | null;
  clubName: string | null;
  gold: number;
  silver: number;
  bronze: number;
};

export type HistoryMatch = {
  key: string;
  opponentName: string;
  // False when both athletes lost, because this athlete lost too.
  didWin: boolean;
  resultType: ResultType | null;
};

/** One category an athlete has fought in. */
export type HistoryCategory = {
  entryId: string;
  tournamentName: string;
  categoryTitle: string;
  // Null until the category has finished, or if the athlete took no place.
  place: number | null;
  matches: HistoryMatch[];
};
