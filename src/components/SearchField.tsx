/**
 * =====================================================
 * FILE: SearchField.tsx
 * PURPOSE: A compact search box. The icon and hint say what
 *          it's for, so it needs no heading taking up space.
 * USED BY: screens with long lists
 * =====================================================
 */
import { useColorScheme } from 'nativewind';
import { TextInput, View } from 'react-native';

import { AppIcon } from './AppIcon';

type SearchFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
};

export function SearchField({ label, value, onChangeText }: SearchFieldProps) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="min-h-12 flex-1 basis-64 flex-row items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 dark:border-stone-600 dark:bg-stone-800">
      <AppIcon name="search" tone="soft" size={20} />
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor={colorScheme === 'dark' ? '#A99D8A' : '#7E7364'}
        value={value}
        onChangeText={onChangeText}
        className="min-h-12 flex-1 text-lg text-stone-900 dark:text-stone-100"
      />
    </View>
  );
}
