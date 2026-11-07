/**
 * =====================================================
 * FILE: BracketPreview.tsx
 * PURPOSE: Shows who is where on the draw sheet, pool by
 *          pool. Tapping an athlete selects them for a swap.
 * USED BY: DrawResult.tsx
 * =====================================================
 */
import { Pressable, ScrollView, Text, View } from 'react-native';

import { getBracketLayout, getBracketSize, getPoolAt } from '@/lib/brackets/bracketLayout';
import { useT } from '@/lib/i18n/useT';

import type { DrawEntry } from '../types';

const POOLS = ['A', 'B', 'C', 'D'] as const;

type BracketPreviewProps = {
  entries: readonly DrawEntry[];
  selectedEntryId: string | null;
  // Null once locked, when athletes can no longer be swapped.
  onSelect: ((entry: DrawEntry) => void) | null;
};

export function BracketPreview({ entries, selectedEntryId, onSelect }: BracketPreviewProps) {
  const t = useT();
  const layout = getBracketLayout(getBracketSize(entries.length));
  const byPosition = new Map(entries.map((entry) => [entry.drawPosition, entry]));

  function renderAthlete(entry: DrawEntry) {
    const seed = entry.seed === null ? '' : ` (${t('draw.seedShort', { seed: entry.seed })})`;
    const isSelected = entry.entryId === selectedEntryId;

    return (
      <Pressable
        key={entry.entryId}
        accessibilityRole="button"
        disabled={onSelect === null}
        onPress={() => onSelect?.(entry)}
        className={`min-h-12 flex-1 justify-center rounded-lg border px-3 py-1 ${isSelected ? 'border-judo-blue bg-blue-100 dark:bg-blue-950' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'}`}
      >
        <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {`${isSelected ? '✓ ' : ''}${entry.drawPosition}. ${entry.name}${seed}`}
        </Text>
        <Text className="text-sm text-slate-700 dark:text-slate-200">
          {entry.clubName ?? t('athletes.noClub')}
        </Text>
      </Pressable>
    );
  }

  return (
    <ScrollView contentContainerClassName="gap-3 pb-3">
      {POOLS.map((pool) => {
        // Neighbours on the sheet are first-round opponents, so group them in twos.
        const pairs: DrawEntry[][] = [];
        for (let index = 0; index < layout.length; index += 2) {
          if (getPoolAt(index, layout.length) === pool) {
            const pair = [byPosition.get(layout[index]), byPosition.get(layout[index + 1])];
            pairs.push(pair.filter((entry) => entry !== undefined));
          }
        }

        return (
          <View key={pool} className="gap-2">
            <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {t('draw.pool', { pool })}
            </Text>
            {pairs
              .filter((pair) => pair.length > 0)
              .map((pair) => (
                <View key={pair[0]?.entryId} className="flex-row items-center gap-2">
                  {pair.map(renderAthlete)}
                  {pair.length === 1 && (
                    <Text className="flex-1 text-center text-base text-slate-700 dark:text-slate-200">
                      {t('draw.bye')}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        );
      })}
    </ScrollView>
  );
}
