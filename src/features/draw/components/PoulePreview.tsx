/**
 * =====================================================
 * FILE: PoulePreview.tsx
 * PURPOSE: Shows who is in each poule, and the order of
 *          their matches.
 * USED BY: DrawResult.tsx
 * =====================================================
 */
import { ScrollView, Text, View } from 'react-native';

import {
  getPouleSchedule,
  putSameClubMatchesFirst,
  splitIntoTwoPoules,
} from '@/lib/brackets/pouleSchedule';
import { useT } from '@/lib/i18n/useT';

import type { DrawEntry } from '../types';
import { DrawAthleteButton } from './DrawAthleteButton';

type PoulePreviewProps = {
  entries: readonly DrawEntry[];
  hasTwoPoules: boolean;
  selectedEntryId: string | null;
  // Null once locked, when athletes can no longer be swapped.
  onSelect: ((entry: DrawEntry) => void) | null;
};

export function PoulePreview({
  entries,
  hasTwoPoules,
  selectedEntryId,
  onSelect,
}: PoulePreviewProps) {
  const t = useT();
  const allPositions = entries.map((entry) => entry.drawPosition ?? 0);
  const poules = hasTwoPoules ? splitIntoTwoPoules(allPositions) : [allPositions];

  return (
    <ScrollView contentContainerClassName="gap-4 pb-3">
      {poules.map((positions, pouleIndex) => {
        const members = positions
          .slice()
          .sort((a, b) => a - b)
          .map((position) => entries.find((entry) => entry.drawPosition === position))
          .filter((entry) => entry !== undefined);

        // The schedule numbers athletes from 1 within their own poule.
        const memberAt = (number: number) => members[number - 1];
        const schedule = putSameClubMatchesFirst(
          getPouleSchedule(members.length),
          (number) => memberAt(number)?.clubId ?? null,
        );

        return (
          <View key={String(pouleIndex)} className="gap-2">
            {hasTwoPoules && (
              <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {t('draw.poule', { poule: pouleIndex === 0 ? 'A' : 'B' })}
              </Text>
            )}
            {members.map((entry) => (
              <DrawAthleteButton
                key={entry.entryId}
                entry={entry}
                isSelected={entry.entryId === selectedEntryId}
                onSelect={onSelect}
              />
            ))}
            <Text className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t(members.length === 2 ? 'draw.bestOfThree' : 'draw.matchOrder')}
            </Text>
            {schedule.map(([first, second], index) => (
              <Text
                key={String(index)}
                className="text-base text-stone-700 dark:text-stone-200"
              >
                {`${index + 1}. ${memberAt(first)?.name ?? ''} x ${memberAt(second)?.name ?? ''}`}
              </Text>
            ))}
          </View>
        );
      })}
      {hasTwoPoules && (
        <Text className="text-base text-stone-700 dark:text-stone-200">
          {t('draw.twoPoulesFinals')}
        </Text>
      )}
    </ScrollView>
  );
}
