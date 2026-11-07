/**
 * =====================================================
 * FILE: CategoryWeightFields.tsx
 * PURPOSE: The minimum and maximum weight inputs of the
 *          category form.
 * USED BY: CategoryFormFields.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';

import type { CategoryFormErrors } from '../validateCategoryForm';

type CategoryWeightFieldsProps = {
  minKg: string;
  maxKg: string;
  errors: CategoryFormErrors;
  onMinKgChange: (text: string) => void;
  onMaxKgChange: (text: string) => void;
};

export function CategoryWeightFields({
  minKg,
  maxKg,
  errors,
  onMinKgChange,
  onMaxKgChange,
}: CategoryWeightFieldsProps) {
  const t = useT();

  return (
    <View className="gap-1">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <TextField
            label={t('categories.minKg')}
            value={minKg}
            onChangeText={onMinKgChange}
            error={errors.minKg ? t('categories.kgInvalid') : undefined}
            keyboardType="decimal-pad"
            maxLength={6}
          />
        </View>
        <View className="flex-1">
          <TextField
            label={t('categories.maxKg')}
            value={maxKg}
            onChangeText={onMaxKgChange}
            error={errors.maxKg ? t('categories.kgInvalid') : undefined}
            keyboardType="decimal-pad"
            maxLength={6}
          />
        </View>
      </View>
      {errors.range && (
        <Text className="text-base font-semibold text-red-700 dark:text-red-300">
          {t('categories.kgRange')}
        </Text>
      )}
    </View>
  );
}
