/**
 * =====================================================
 * FILE: AthleteOptionRow.tsx
 * PURPOSE: One athlete that can be added to a category.
 * USED BY: AddAthletesScreen.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import { checkEligibility } from '../checkEligibility';
import type { CategoryRules, RegistrationAthlete } from '../types';
import { EligibilityWarnings } from './EligibilityWarnings';

type AthleteOptionRowProps = {
  athlete: RegistrationAthlete;
  category: CategoryRules;
  isDisabled: boolean;
  onPress: () => void;
};

export function AthleteOptionRow({
  athlete,
  category,
  isDisabled,
  onPress,
}: AthleteOptionRowProps) {
  const t = useT();
  const club = athlete.clubName ?? t('athletes.noClub');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className="min-h-16 justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 dark:border-stone-600 dark:bg-stone-800"
    >
      <Text className="text-xl font-semibold text-stone-900 dark:text-stone-100">
        {`+ ${athlete.name}`}
      </Text>
      <Text className="text-base text-stone-700 dark:text-stone-200">
        {`${club} · ${athlete.birthYear}`}
      </Text>
      <EligibilityWarnings warnings={checkEligibility(athlete, category)} />
    </Pressable>
  );
}
