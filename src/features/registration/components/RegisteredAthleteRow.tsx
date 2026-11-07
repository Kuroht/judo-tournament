/**
 * =====================================================
 * FILE: RegisteredAthleteRow.tsx
 * PURPOSE: One athlete registered in a category.
 * USED BY: CategoryRegistrationScreen.tsx
 * =====================================================
 */
import { Pressable, Text, View } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import { checkEligibility } from '../checkEligibility';
import type { CategoryRules, RegisteredAthlete } from '../types';
import { EligibilityWarnings } from './EligibilityWarnings';

type RegisteredAthleteRowProps = {
  athlete: RegisteredAthlete;
  category: CategoryRules;
  isDisabled: boolean;
  onRemove: () => void;
};

export function RegisteredAthleteRow({
  athlete,
  category,
  isDisabled,
  onRemove,
}: RegisteredAthleteRowProps) {
  const t = useT();
  const club = athlete.clubName ?? t('athletes.noClub');

  return (
    <View className="min-h-16 flex-row items-center gap-3 rounded-lg border border-stone-300 bg-white px-4 py-2 dark:border-stone-600 dark:bg-stone-800">
      <View className="flex-1">
        <Text className="text-xl font-semibold text-stone-900 dark:text-stone-100">
          {athlete.name}
        </Text>
        <Text className="text-base text-stone-700 dark:text-stone-200">
          {`${club} · ${athlete.birthYear}`}
        </Text>
        <EligibilityWarnings warnings={checkEligibility(athlete, category)} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('registration.removeLabel', { name: athlete.name })}
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        onPress={onRemove}
        className="min-h-12 justify-center rounded-lg border border-red-700 px-3"
      >
        <Text className="text-base font-semibold text-red-700 dark:text-red-300">
          {t('registration.remove')}
        </Text>
      </Pressable>
    </View>
  );
}
