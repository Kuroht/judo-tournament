/**
 * =====================================================
 * FILE: WeighInRow.tsx
 * PURPOSE: One athlete in the weigh-in list.
 * USED BY: WeighInContent.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import { useWeighInText } from '../hooks/useWeighInText';
import type { EntryStatus, WeighInEntry } from '../types';

// Full class names, because Tailwind can't find class names built from pieces.
const STATUS_CLASSES: Record<EntryStatus, string> = {
  registered: 'text-stone-700 dark:text-stone-200',
  passed: 'text-green-800 dark:text-green-300',
  failed: 'text-red-700 dark:text-red-300',
  noShow: 'text-amber-800 dark:text-amber-300',
  withdrawn: 'text-amber-800 dark:text-amber-300',
};

type WeighInRowProps = {
  entry: WeighInEntry;
  onPress: () => void;
};

export function WeighInRow({ entry, onPress }: WeighInRowProps) {
  const t = useT();
  const { statusText } = useWeighInText();
  const club = entry.clubName ?? t('athletes.noClub');
  const category = [entry.ageClassName, entry.categoryLabel].filter((part) => part !== null);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-16 justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 dark:border-stone-600 dark:bg-stone-800"
    >
      <Text className="text-xl font-semibold text-stone-900 dark:text-stone-100">{entry.name}</Text>
      <Text className="text-base text-stone-700 dark:text-stone-200">
        {`${category.join(' · ')} · ${club}`}
      </Text>
      <Text className={`text-lg font-semibold ${STATUS_CLASSES[entry.status]}`}>
        {statusText(entry)}
      </Text>
    </Pressable>
  );
}
