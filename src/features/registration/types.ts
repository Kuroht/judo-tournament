/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the registration feature.
 * USED BY: the registration feature
 * =====================================================
 */

export type AthleteSex = 'male' | 'female';

/** A category in the registration list, with how many athletes are in it. */
export type RegistrationSummary = {
  categoryId: string;
  label: string;
  sex: 'male' | 'female' | 'mixed';
  ageClassName: string | null;
  entryCount: number;
};

/** What's needed about a category to check whether an athlete fits it. */
export type CategoryRules = {
  id: string;
  label: string;
  sex: 'male' | 'female' | 'mixed';
  ageClassName: string | null;
  minAge: number | null;
  maxAge: number | null;
  seasonYear: number;
};

/** What's needed about an athlete to show them and check whether they fit. */
export type RegistrationAthlete = {
  athleteId: string;
  name: string;
  clubName: string | null;
  birthYear: number;
  sex: AthleteSex;
};

/** An athlete already registered in a category. */
export type RegisteredAthlete = RegistrationAthlete & {
  entryId: string;
};

/** Everything the registration screens show for one category. */
export type CategoryRegistration = {
  category: CategoryRules;
  registered: RegisteredAthlete[];
  available: RegistrationAthlete[];
};

/** One reason an athlete may not fit a category. */
export type EligibilityWarning =
  | { type: 'sex' }
  | { type: 'tooYoung'; age: number; minAge: number }
  | { type: 'tooOld'; age: number; maxAge: number };
