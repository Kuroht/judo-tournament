/**
 * =====================================================
 * FILE: CategoryResultCard.tsx
 * PURPOSE: One category's final places, or how far it has
 *          got while its matches are still being fought.
 * USED BY: ResultsScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import type { CategoryResult } from '../types';

type CategoryResultCardProps = {
  result: CategoryResult;
};

export function CategoryResultCard({ result }: CategoryResultCardProps) {
  const t = useT();

  return (
    <View className="gap-1 rounded-lg bg-white p-4 dark:bg-slate-800">
      <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{result.title}</Text>
      {!result.isComplete && (
        <Text className="text-base text-slate-700 dark:text-slate-200">
          {t('results.inProgress', { done: result.finishedCount, total: result.totalCount })}
        </Text>
      )}
      {result.isComplete &&
        result.placed.map(({ place, athlete }) => (
          <Text key={athlete.entryId} className="text-lg text-slate-900 dark:text-slate-100">
            {[t('results.place', { place }), athlete.name, athlete.clubName]
              .filter((part) => part !== null)
              .join(' · ')}
          </Text>
        ))}
    </View>
  );
}
