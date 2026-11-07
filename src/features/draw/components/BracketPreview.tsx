/**
 * =====================================================
 * FILE: BracketPreview.tsx
 * PURPOSE: Shows who is where on an elimination draw sheet,
 *          pool by pool.
 * USED BY: DrawResult.tsx
 * =====================================================
 */
import { ScrollView, Text, View } from 'react-native';

import { getBracketLayout, getBracketSize, getPoolAt } from '@/lib/brackets/bracketLayout';
import { useT } from '@/lib/i18n/useT';

import type { DrawEntry } from '../types';
import { DrawAthleteButton } from './DrawAthleteButton';

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
            <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {t('draw.pool', { pool })}
            </Text>
            {pairs
              .filter((pair) => pair.length > 0)
              .map((pair) => (
                <View key={pair[0]?.entryId} className="flex-row items-center gap-2">
                  {pair.map((entry) => (
                    <View key={entry.entryId} className="flex-1">
                      <DrawAthleteButton
                        entry={entry}
                        isSelected={entry.entryId === selectedEntryId}
                        onSelect={onSelect}
                      />
                    </View>
                  ))}
                  {pair.length === 1 && (
                    <Text className="flex-1 text-center text-base text-stone-700 dark:text-stone-200">
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
