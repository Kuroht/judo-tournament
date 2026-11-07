/**
 * =====================================================
 * FILE: SettingsScreen.tsx
 * PURPOSE: The content of the settings tab.
 * USED BY: src/app/(tabs)/settings.tsx
 * =====================================================
 */
import { View } from 'react-native';

import { Screen } from '@/components/Screen';

import { DatabaseSummaryText } from './DatabaseSummaryText';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';

export function SettingsScreen() {
  return (
    <Screen>
      <View className="gap-6">
        <LanguageSelector />
        <ThemeSelector />
        <DatabaseSummaryText />
      </View>
    </Screen>
  );
}
