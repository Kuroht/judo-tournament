/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the tournaments feature.
 * USED BY: the tournaments feature
 * =====================================================
 */

/** The details the trainer types in. Dates are stored as "2026-12-31". */
export type TournamentData = {
  name: string;
  date: string;
  place: string | null;
  seasonYear: number;
};

export type Tournament = TournamentData & {
  id: string;
  isArchived: boolean;
  categoryCount: number;
  entryCount: number;
};

/** What the form holds while typing, which may not be valid yet. */
export type TournamentFormValues = {
  name: string;
  date: string;
  place: string;
  seasonYear: string;
};
