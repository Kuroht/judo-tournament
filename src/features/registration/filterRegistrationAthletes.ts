/**
 * =====================================================
 * FILE: filterRegistrationAthletes.ts
 * PURPOSE: Applies the search box to the athletes that can
 *          be registered. A pure function, so it's easy to
 *          test.
 * USED BY: AddAthletesContent.tsx
 * =====================================================
 */
import { matchesSearch } from '@/lib/text/matchesSearch';

import type { RegistrationAthlete } from './types';

/**
 * Keeps the athletes whose name or club matches the search. Clubs often register
 * their athletes together, so typing a club's name finds all of them.
 * @param athletes the full list
 * @param search typed text, ignoring accents
 * @returns the matching athletes, in the same order
 */
export function filterRegistrationAthletes(
  athletes: readonly RegistrationAthlete[],
  search: string,
): RegistrationAthlete[] {
  return athletes.filter(
    (athlete) =>
      matchesSearch(athlete.name, search) || matchesSearch(athlete.clubName ?? '', search),
  );
}
