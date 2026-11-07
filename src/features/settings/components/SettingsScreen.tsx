/**
 * =====================================================
 * FILE: SettingsScreen.tsx
 * PURPOSE: The content of the settings tab.
 * USED BY: src/app/(tabs)/settings.tsx
 * =====================================================
 */
import { router } from 'expo-router';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { DatabaseSummaryText } from './DatabaseSummaryText';
import { LanguageSelector } from './LanguageSelector';
import { SeasonYearField } from './SeasonYearField';
import { ThemeSelector } from './ThemeSelector';

export function SettingsScreen() {
  const t = useT();

  return (
    <Screen>
      <View className="gap-6">
        <LanguageSelector />
        <ThemeSelector />
        <SeasonYearField />
        <Button label={t('settings.rulePresets')} onPress={() => router.push('/rule-presets')} />
        <Button label={t('backup.title')} onPress={() => router.push('/data-tools')} />
        <DatabaseSummaryText />
      </View>
    </Screen>
  );
}
