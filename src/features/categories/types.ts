/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the categories feature.
 * USED BY: the categories feature
 * =====================================================
 */

export type CategorySex = 'male' | 'female' | 'mixed';

export type CategoryFormat =
  | 'doubleRepechage'
  | 'quarterFinalRepechage'
  | 'poule'
  | 'twoPoules'
  | 'directKnockout';

/** The saved data of a category, without its ids. */
export type CategoryData = {
  ageClassId: string | null;
  sex: CategorySex;
  label: string;
  minKg: number | null;
  maxKg: number | null;
  format: CategoryFormat;
  isFreeGrouping: boolean;
};

export type Category = CategoryData & {
  id: string;
  tournamentId: string;
};

/** A category in a list, with its age class name ready to show. */
export type CategoryListItem = Category & {
  ageClassName: string | null;
};

/** What the form holds while typing, which may not be valid yet. */
export type CategoryFormValues = {
  ageClassId: string | null;
  sex: CategorySex;
  label: string;
  minKg: string;
  maxKg: string;
  format: CategoryFormat;
  isFreeGrouping: boolean;
};

export type AgeClassOption = {
  id: string;
  name: string;
  isVerified: boolean;
  hasWeightCategories: boolean;
};

/** A delete can be refused, which is a normal outcome rather than an error. */
export type DeleteCategoryResult = { type: 'deleted' } | { type: 'blocked'; entryCount: number };

/** How many categories an import created, and how many already existed. */
export type AddFpjCategoriesResult = {
  addedCount: number;
  skippedCount: number;
};
