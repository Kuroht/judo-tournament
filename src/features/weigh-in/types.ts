/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the weigh-in feature.
 * USED BY: the weigh-in feature
 * =====================================================
 */

export type EntryStatus = 'registered' | 'passed' | 'failed' | 'noShow' | 'withdrawn';

export type WeightResult = 'pass' | 'over' | 'under';

/** What decides whether a weight fits a category. */
export type WeightLimits = {
  minKg: number | null;
  maxKg: number | null;
  isFreeGrouping: boolean;
  toleranceGrams: number;
};

/** A category an athlete could be moved to. */
export type WeighInCategory = WeightLimits & {
  id: string;
  label: string;
  sex: 'male' | 'female' | 'mixed';
  ageClassId: string | null;
  ageClassName: string | null;
};

/** One athlete's registration, with everything the weigh-in shows about it. */
export type WeighInEntry = WeightLimits & {
  entryId: string;
  athleteId: string;
  name: string;
  clubName: string | null;
  athleteSex: 'male' | 'female';
  categoryId: string;
  categoryLabel: string;
  categorySex: 'male' | 'female' | 'mixed';
  ageClassId: string | null;
  ageClassName: string | null;
  weighedKg: number | null;
  status: EntryStatus;
};

export type WeighInData = {
  entries: WeighInEntry[];
  categories: WeighInCategory[];
};
