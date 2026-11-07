/**
 * =====================================================
 * FILE: filterAthletes.ts
 * PURPOSE: Applies the search box and club filter. A pure
 *          function, so it's easy to test.
 * USED BY: AthletesScreen.tsx, AthleteFilters.tsx,
 *          AthleteFormFields.tsx
 * =====================================================
 */
import { matchesSearch } from '@/lib/text/matchesSearch';

import type { AthleteListItem } from './types';

// Real club ids contain a "-", so these two can never clash with one.
export const ALL_CLUBS = 'all';
export const NO_CLUB = 'none';

/**
 * Keeps the athletes that match both the search and the club filter.
 * @param athletes the full list
 * @param search typed text, matched on the name and ignoring accents
 * @param clubFilter ALL_CLUBS, NO_CLUB or a club id
 * @returns the matching athletes, in the same order
 */
export function filterAthletes(
  athletes: readonly AthleteListItem[],
  search: string,
  clubFilter: string,
): AthleteListItem[] {
  return athletes.filter((athlete) => {
    if (!matchesSearch(athlete.name, search)) {
      return false;
    }
    if (clubFilter === ALL_CLUBS) {
      return true;
    }
    if (clubFilter === NO_CLUB) {
      return athlete.clubId === null;
    }

    return athlete.clubId === clubFilter;
  });
}
