/**
 * =====================================================
 * FILE: CategoryRow.tsx
 * PURPOSE: One category in the categories list.
 * USED BY: CategoriesScreen.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

import type { TranslationKey } from '@/lib/i18n/pt';
import { useT } from '@/lib/i18n/useT';

import { CATEGORY_FORMAT_LABELS } from '../categoryFormats';
import type { CategoryListItem, CategorySex } from '../types';

const SEX_LABELS: Record<CategorySex, TranslationKey> = {
  male: 'categories.sex.male',
  female: 'categories.sex.female',
  mixed: 'categories.sex.mixed',
};

type CategoryRowProps = {
  category: CategoryListItem;
  onPress: () => void;
};

export function CategoryRow({ category, onPress }: CategoryRowProps) {
  const t = useT();
  const parts = [
    category.ageClassName,
    t(SEX_LABELS[category.sex]),
    t(CATEGORY_FORMAT_LABELS[category.format]),
  ];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-16 justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 dark:border-stone-600 dark:bg-stone-800"
    >
      <Text className="text-xl font-semibold text-stone-900 dark:text-stone-100">
        {category.label}
      </Text>
      <Text className="text-base text-stone-700 dark:text-stone-200">
        {parts.filter((part) => part !== null).join(' · ')}
      </Text>
    </Pressable>
  );
}
