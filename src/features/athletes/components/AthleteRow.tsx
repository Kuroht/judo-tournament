/**
 * =====================================================
 * FILE: AthleteRow.tsx
 * PURPOSE: One athlete in the athletes list.
 * USED BY: AthletesScreen.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import type { AthleteListItem } from '../types';

type AthleteRowProps = {
  athlete: AthleteListItem;
  onPress: () => void;
};

export function AthleteRow({ athlete, onPress }: AthleteRowProps) {
  const t = useT();
  const club = athlete.clubName ?? t('athletes.noClub');
  const sex = t(athlete.sex === 'male' ? 'athletes.sex.male' : 'athletes.sex.female');

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-16 justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
    >
      <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {athlete.name}
      </Text>
      <Text className="text-base text-slate-700 dark:text-slate-200">
        {`${club} · ${athlete.birthYear} · ${sex}`}
      </Text>
    </Pressable>
  );
}
