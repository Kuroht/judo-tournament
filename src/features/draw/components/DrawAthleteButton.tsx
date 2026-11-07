/**
 * =====================================================
 * FILE: DrawAthleteButton.tsx
 * PURPOSE: One athlete in a finished draw. Tapping them
 *          selects them for a swap.
 * USED BY: BracketPreview.tsx, PoulePreview.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import type { DrawEntry } from '../types';

type DrawAthleteButtonProps = {
  entry: DrawEntry;
  isSelected: boolean;
  // Null once locked, when athletes can no longer be swapped.
  onSelect: ((entry: DrawEntry) => void) | null;
};

export function DrawAthleteButton({ entry, isSelected, onSelect }: DrawAthleteButtonProps) {
  const t = useT();
  const seed = entry.seed === null ? '' : ` (${t('draw.seedShort', { seed: entry.seed })})`;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={onSelect === null}
      onPress={() => onSelect?.(entry)}
      className={`min-h-12 flex-1 justify-center rounded-lg border px-3 py-1 ${isSelected ? 'border-judo-blue bg-blue-100 dark:bg-blue-950' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'}`}
    >
      <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {`${isSelected ? '✓ ' : ''}${entry.drawPosition}. ${entry.name}${seed}`}
      </Text>
      <Text className="text-base text-slate-700 dark:text-slate-200">
        {entry.clubName ?? t('athletes.noClub')}
      </Text>
    </Pressable>
  );
}
