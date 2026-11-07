/**
 * =====================================================
 * FILE: WeighMoveOptions.tsx
 * PURPOSE: Ways to move a weighed athlete: the category
 *          their weight belongs in, any other category, or
 *          a new free group.
 * USED BY: WeighDialog.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { SelectField } from '@/components/SelectField';
import { useT } from '@/lib/i18n/useT';

import type { WeighInCategory, WeighInEntry } from '../types';
import { findCorrectCategory } from '../weightRules';
import { NewFreeGroupForm } from './NewFreeGroupForm';

const NOTHING_CHOSEN = 'none';

type WeighMoveOptionsProps = {
  entry: WeighInEntry;
  categories: readonly WeighInCategory[];
  isBusy: boolean;
  onMove: (target: WeighInCategory) => void;
  onCreateGroup: (label: string) => void;
};

export function WeighMoveOptions({
  entry,
  categories,
  isBusy,
  onMove,
  onCreateGroup,
}: WeighMoveOptionsProps) {
  const t = useT();

  const suggestion =
    entry.status === 'failed' && entry.weighedKg !== null
      ? findCorrectCategory(categories, entry, entry.weighedKg)
      : null;

  // Only categories this athlete could actually compete in, by sex.
  const otherCategories = categories.filter(
    (category) =>
      category.id !== entry.categoryId &&
      (category.sex === entry.athleteSex || category.sex === 'mixed'),
  );

  function handleSelectOther(categoryId: string) {
    const target = otherCategories.find((category) => category.id === categoryId);
    if (target !== undefined) {
      onMove(target);
    }
  }

  return (
    <View className="gap-3">
      {suggestion !== null && (
        <Button
          label={t('weighIn.moveTo', { category: suggestion.label })}
          onPress={() => onMove(suggestion)}
          isDisabled={isBusy}
        />
      )}
      {entry.status === 'failed' && suggestion === null && (
        <Text className="text-base text-slate-700 dark:text-slate-200">
          {t('weighIn.noSuggestion')}
        </Text>
      )}
      <SelectField
        label={t('weighIn.moveToOther')}
        value={NOTHING_CHOSEN}
        options={[
          { value: NOTHING_CHOSEN, label: t('weighIn.chooseCategory') },
          ...otherCategories.map((category) => ({
            value: category.id,
            label: [category.ageClassName, category.label].filter((part) => part !== null).join(' · '),
          })),
        ]}
        searchLabel={t('common.search')}
        closeLabel={t('common.close')}
        onChange={handleSelectOther}
      />
      {entry.isFreeGrouping && <NewFreeGroupForm isBusy={isBusy} onCreate={onCreateGroup} />}
    </View>
  );
}
