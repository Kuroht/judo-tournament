/**
 * =====================================================
 * FILE: CategoryDrawContent.tsx
 * PURPOSE: Shows the right stage of one category's draw:
 *          suggested format, seeds, or the finished draw.
 * USED BY: CategoryDrawScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { CATEGORY_FORMAT_LABELS } from '@/features/categories';
import { suggestFormat } from '@/lib/brackets/suggestFormat';
import { useT } from '@/lib/i18n/useT';

import { isDrawCurrent, isEliminationFormat } from '../drawRules';
import type { useCategoryDraw } from '../hooks/useCategoryDraw';
import type { CategoryDraw } from '../types';
import { DrawResult } from './DrawResult';
import { DrawSetup } from './DrawSetup';

const MIN_ATHLETES_FOR_DRAW = 2;

type CategoryDrawContentProps = {
  data: CategoryDraw;
  draw: ReturnType<typeof useCategoryDraw>;
};

export function CategoryDrawContent({ data, draw }: CategoryDrawContentProps) {
  const t = useT();
  const { entries, format, seed } = data;
  const suggestion = suggestFormat(entries.length);
  const isCurrent = isDrawCurrent(entries, seed, data.drawnEntryCount);
  const title = [data.ageClassName, t(`categories.sex.${data.sex}`), data.label];

  let stage = <EmptyState message={t('draw.tooFewAthletes')} />;
  if (data.isLocked && !isCurrent) {
    // Running a new draw would silently replace a locked one, so it must be unlocked first.
    stage = (
      <EmptyState
        message={t('draw.lockedMessage')}
        actionLabel={t('draw.unlock')}
        onAction={() => void draw.setLocked(false)}
      />
    );
  } else if (entries.length >= MIN_ATHLETES_FOR_DRAW) {
    if (!isEliminationFormat(format)) {
      stage = <EmptyState message={t('draw.poulesComingSoon')} />;
    } else if (isCurrent && seed !== null) {
      stage = (
        <DrawResult
          entries={entries}
          seed={seed}
          isLocked={data.isLocked}
          isBusy={draw.isBusy}
          onSwap={(first, second) => void draw.swap(first, second)}
          onRedraw={() => void draw.runDraw(entries, '')}
          onChangeSeeds={() => void draw.clear()}
          onSetLocked={(isLocked) => void draw.setLocked(isLocked)}
        />
      );
    } else {
      stage = (
        <DrawSetup
          entries={entries}
          isBusy={draw.isBusy}
          onToggleSeed={(entry) => void draw.toggleSeed(entry, entries)}
          onRunDraw={(typedSeed) => void draw.runDraw(entries, typedSeed)}
        />
      );
    }
  }

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {title.filter((part) => part !== null).join(' · ')}
        </Text>
        <Text className="text-base text-slate-700 dark:text-slate-200">
          {`${t('draw.athleteCount', { count: entries.length })} · ${t(CATEGORY_FORMAT_LABELS[format])}`}
        </Text>
        {data.unweighedCount > 0 && (
          <Text className="text-base font-semibold text-amber-800 dark:text-amber-300">
            {`⚠ ${t('draw.unweighed', { count: data.unweighedCount })}`}
          </Text>
        )}
        {seed !== null && !isCurrent && (
          <Text className="text-base font-semibold text-amber-800 dark:text-amber-300">
            {`⚠ ${t('draw.outOfDate')}`}
          </Text>
        )}
        {!data.isLocked && suggestion !== format && entries.length >= MIN_ATHLETES_FOR_DRAW && (
          <Button
            label={t('draw.useSuggestion', { format: t(CATEGORY_FORMAT_LABELS[suggestion]) })}
            variant="secondary"
            onPress={() => void draw.setFormat(suggestion)}
            isDisabled={draw.isBusy}
          />
        )}
        {draw.hasActionFailed && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
            {t('common.saveError')}
          </Text>
        )}
        {stage}
      </View>
    </Screen>
  );
}
