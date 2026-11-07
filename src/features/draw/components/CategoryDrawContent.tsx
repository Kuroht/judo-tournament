/**
 * =====================================================
 * FILE: CategoryDrawContent.tsx
 * PURPOSE: One category's draw page: its details, warnings
 *          and suggested format, above the current stage.
 * USED BY: CategoryDrawScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { CATEGORY_FORMAT_LABELS } from '@/features/categories';
import { suggestFormat } from '@/lib/brackets/suggestFormat';
import { useT } from '@/lib/i18n/useT';

import { isDrawCurrent } from '../drawRules';
import type { useCategoryDraw } from '../hooks/useCategoryDraw';
import type { CategoryDraw } from '../types';
import { DrawStage } from './DrawStage';

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

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <Text className="text-xl font-bold text-stone-900 dark:text-stone-100">
          {title.filter((part) => part !== null).join(' · ')}
        </Text>
        <Text className="text-base text-stone-700 dark:text-stone-200">
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
        {!data.isLocked && suggestion !== format && entries.length >= 2 && (
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
        <DrawStage data={data} draw={draw} isCurrent={isCurrent} />
      </View>
    </Screen>
  );
}
