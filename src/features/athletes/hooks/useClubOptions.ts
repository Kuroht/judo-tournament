/**
 * =====================================================
 * FILE: useClubOptions.ts
 * PURPOSE: Turns the clubs into options for a SelectField.
 * USED BY: AthleteFilters.tsx, AthleteFormFields.tsx
 * =====================================================
 */
import type { SelectOption } from '@/components/SelectField';
import { useClubs } from '@/features/clubs';

/**
 * Reads the clubs as a list of select options.
 * @returns one option per club. It's empty until the clubs have loaded, so
 *          the field still works with its "no club" option in the meantime.
 */
export function useClubOptions(): SelectOption[] {
  const clubs = useClubs();

  if (clubs.type !== 'ready') {
    return [];
  }

  return clubs.data.map((club) => ({ value: club.id, label: club.name }));
}
