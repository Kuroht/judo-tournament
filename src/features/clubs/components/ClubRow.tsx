/**
 * =====================================================
 * FILE: ClubRow.tsx
 * PURPOSE: One club in the clubs list.
 * USED BY: ClubsScreen.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import type { ClubListItem } from '../types';

type ClubRowProps = {
  club: ClubListItem;
  onPress: () => void;
};

export function ClubRow({ club, onPress }: ClubRowProps) {
  const t = useT();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-16 justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
    >
      <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100">{club.name}</Text>
      <Text className="text-base text-slate-700 dark:text-slate-200">
        {t('clubs.athleteCount', { count: club.athleteCount })}
      </Text>
    </Pressable>
  );
}
