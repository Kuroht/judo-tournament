/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the draw feature.
 * USED BY: the draw feature
 * =====================================================
 */
import type { CategoryFormat } from '@/features/categories';

/** A category in the draw list. */
export type DrawSummary = {
  categoryId: string;
  label: string;
  sex: 'male' | 'female' | 'mixed';
  ageClassName: string | null;
  entryCount: number;
  // 'none' means no draw yet, and 'draft' means drawn but not locked.
  drawState: 'none' | 'draft' | 'locked';
};

/** An athlete taking part in a draw. */
export type DrawEntry = {
  entryId: string;
  name: string;
  clubId: string | null;
  clubName: string | null;
  seed: number | null;
  drawPosition: number | null;
};

/** Everything the draw screen shows for one category. */
export type CategoryDraw = {
  categoryId: string;
  label: string;
  sex: 'male' | 'female' | 'mixed';
  ageClassName: string | null;
  format: CategoryFormat;
  // Only athletes who can compete: not failed, not absent and not withdrawn.
  entries: DrawEntry[];
  // How many of those haven't been weighed yet.
  unweighedCount: number;
  // The text the draw's random numbers came from, or null if not drawn.
  seed: string | null;
  // How many athletes the saved draw was made for, or null if not drawn.
  drawnEntryCount: number | null;
  isLocked: boolean;
};
