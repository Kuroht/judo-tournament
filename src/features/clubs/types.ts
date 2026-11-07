/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the clubs feature.
 * USED BY: the clubs feature, and athletes through index.ts
 * =====================================================
 */

export type Club = {
  id: string;
  name: string;
};

/** A club in a list, with how many athletes belong to it. */
export type ClubListItem = Club & {
  athleteCount: number;
};

/** A delete can be refused, which is a normal outcome rather than an error. */
export type DeleteClubResult = { type: 'deleted' } | { type: 'blocked'; athleteCount: number };
