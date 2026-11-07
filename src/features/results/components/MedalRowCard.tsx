/**
 * =====================================================
 * FILE: MedalRowCard.tsx
 * PURPOSE: One club's line in the medal table.
 * USED BY: ResultsScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import type { MedalRow } from '../types';

type MedalRowCardProps = {
  row: MedalRow;
};

export function MedalRowCard({ row }: MedalRowCardProps) {
  const t = useT();

  return (
    <View className="gap-1 rounded-lg bg-white p-4 dark:bg-slate-800">
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {row.clubName ?? t('results.noClub')}
      </Text>
      {/* Written out in words, so that the medals don't depend on color. */}
      <Text className="text-lg text-slate-900 dark:text-slate-100">
        {t('results.medalCounts', { gold: row.gold, silver: row.silver, bronze: row.bronze })}
      </Text>
    </View>
  );
}
