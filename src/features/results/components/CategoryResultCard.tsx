/**
 * =====================================================
 * FILE: CategoryResultCard.tsx
 * PURPOSE: One category's final places, or how far it has
 *          got while its matches are still being fought.
 * USED BY: ResultsScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { AppIcon, type IconTone } from '@/components/AppIcon';
import { useT } from '@/lib/i18n/useT';

import type { CategoryResult } from '../types';

// Gold, silver and bronze. The place is also written out, so it doesn't depend on color.
const MEDAL_TONES: Record<number, IconTone> = { 1: 'gold', 2: 'silver', 3: 'bronze' };

type CategoryResultCardProps = {
  result: CategoryResult;
};

export function CategoryResultCard({ result }: CategoryResultCardProps) {
  const t = useT();

  return (
    <View className="gap-2 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-800">
      <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">{result.title}</Text>
      {!result.isComplete && (
        <Text className="text-base text-stone-700 dark:text-stone-200">
          {t('results.inProgress', { done: result.finishedCount, total: result.totalCount })}
        </Text>
      )}
      {result.isComplete &&
        result.placed.map(({ place, athlete }) => (
          <View key={athlete.entryId} className="flex-row items-center gap-2">
            <AppIcon
              name={place <= 3 ? 'medal' : 'ellipse-outline'}
              tone={MEDAL_TONES[place] ?? 'soft'}
            />
            <Text className="flex-1 text-lg text-stone-900 dark:text-stone-100">
              {[t('results.place', { place }), athlete.name, athlete.clubName]
                .filter((part) => part !== null)
                .join(' · ')}
            </Text>
          </View>
        ))}
    </View>
  );
}
