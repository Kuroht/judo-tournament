/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the athletes feature.
 * USED BY: the athletes feature
 * =====================================================
 */

export type Sex = 'male' | 'female';

/** The saved data of an athlete, without the id. */
export type AthleteData = {
  name: string;
  clubId: string | null;
  birthYear: number;
  sex: Sex;
  belt: string | null;
  notes: string | null;
};

export type Athlete = AthleteData & {
  id: string;
};

/** An athlete in a list, with the club's name ready to show. */
export type AthleteListItem = Athlete & {
  clubName: string | null;
};

/** What the form holds while typing, which may not be valid yet. */
export type AthleteFormValues = {
  name: string;
  birthYear: string;
  sex: Sex | null;
  clubId: string | null;
  belt: string;
  notes: string;
};

/** A delete can be refused, which is a normal outcome rather than an error. */
export type DeleteAthleteResult = { type: 'deleted' } | { type: 'blocked'; entryCount: number };
