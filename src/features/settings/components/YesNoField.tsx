/**
 * =====================================================
 * FILE: YesNoField.tsx
 * PURPOSE: A labelled choice between yes and no.
 * USED BY: RulePresetFormScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { OptionButton } from '@/components/OptionButton';
import { useT } from '@/lib/i18n/useT';

type YesNoFieldProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  const t = useT();

  return (
    <View className="gap-1">
      <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">{label}</Text>
      <View className="flex-row gap-2">
        <OptionButton label={t('settings.yes')} isSelected={value} onPress={() => onChange(true)} />
        <OptionButton
          label={t('settings.no')}
          isSelected={!value}
          onPress={() => onChange(false)}
        />
      </View>
    </View>
  );
}
