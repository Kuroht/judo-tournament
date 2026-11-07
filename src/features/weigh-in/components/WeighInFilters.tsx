/**
 * =====================================================
 * FILE: WeighInFilters.tsx
 * PURPOSE: The search box and filters above the weigh-in
 *          list.
 * USED BY: WeighInContent.tsx
 * =====================================================
 */
import { View } from 'react-native';

import { OptionButton } from '@/components/OptionButton';
import { SelectField } from '@/components/SelectField';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

import type { WeighInCategory } from '../types';
import { ALL_CATEGORIES } from '../weighInList';

type WeighInFiltersProps = {
  categories: readonly WeighInCategory[];
  search: string;
  categoryFilter: string;
  isPendingOnly: boolean;
  onSearchChange: (search: string) => void;
  onCategoryFilterChange: (categoryId: string) => void;
  onPendingOnlyChange: (isPendingOnly: boolean) => void;
};

export function WeighInFilters({
  categories,
  search,
  categoryFilter,
  isPendingOnly,
  onSearchChange,
  onCategoryFilterChange,
  onPendingOnlyChange,
}: WeighInFiltersProps) {
  const t = useT();

  return (
    <>
      <TextField label={t('common.search')} value={search} onChangeText={onSearchChange} />
      <SelectField
        label={t('weighIn.filterByCategory')}
        value={categoryFilter}
        options={[
          { value: ALL_CATEGORIES, label: t('weighIn.allCategories') },
          ...categories.map((category) => ({
            value: category.id,
            label: [category.ageClassName, t(`categories.sex.${category.sex}`), category.label]
              .filter((part) => part !== null)
              .join(' · '),
          })),
        ]}
        searchLabel={t('common.search')}
        closeLabel={t('common.close')}
        onChange={onCategoryFilterChange}
      />
      <View className="flex-row gap-2">
        <OptionButton
          label={t('weighIn.showAll')}
          isSelected={!isPendingOnly}
          onPress={() => onPendingOnlyChange(false)}
        />
        <OptionButton
          label={t('weighIn.showPending')}
          isSelected={isPendingOnly}
          onPress={() => onPendingOnlyChange(true)}
        />
      </View>
    </>
  );
}
