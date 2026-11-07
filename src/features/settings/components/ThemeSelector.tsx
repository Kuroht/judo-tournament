/**
 * =====================================================
 * FILE: ThemeSelector.tsx
 * PURPOSE: Lets the trainer choose the system, light or
 *          dark theme.
 * USED BY: SettingsScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { OptionButton } from '@/components/OptionButton';
import { useT } from '@/lib/i18n/useT';

import { useThemePreference } from '../hooks/useThemePreference';

export function ThemeSelector() {
  const { preference, selectPreference } = useThemePreference();
  const t = useT();

  return (
    <View className="gap-2">
      <Text className="text-lg font-bold text-slate-900 dark:text-slate-100">
        {t('settings.theme')}
      </Text>
      <View className="flex-row gap-2">
        <OptionButton
          label={t('settings.theme.system')}
          isSelected={preference === 'system'}
          onPress={() => selectPreference('system')}
        />
        <OptionButton
          label={t('settings.theme.light')}
          isSelected={preference === 'light'}
          onPress={() => selectPreference('light')}
        />
        <OptionButton
          label={t('settings.theme.dark')}
          isSelected={preference === 'dark'}
          onPress={() => selectPreference('dark')}
        />
      </View>
    </View>
  );
}
