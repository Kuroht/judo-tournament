/**
 * =====================================================
 * FILE: CategoryOptionRow.tsx
 * PURPOSE: A labelled row of choices in the category form.
 * USED BY: CategoryFormFields.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { OptionButton } from '@/components/OptionButton';

type RowOption = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

type CategoryOptionRowProps = {
  label: string;
  options: readonly RowOption[];
};

export function CategoryOptionRow({ label, options }: CategoryOptionRowProps) {
  return (
    <View className="gap-1">
      <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">{label}</Text>
      <View className="flex-row gap-2">
        {options.map((option) => (
          <OptionButton
            key={option.label}
            label={option.label}
            isSelected={option.isSelected}
            onPress={option.onPress}
          />
        ))}
      </View>
    </View>
  );
}
