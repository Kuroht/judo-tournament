/**
 * =====================================================
 * FILE: SettingsScreen.tsx
 * PURPOSE: The content of the settings tab.
 * USED BY: src/app/(tabs)/settings.tsx
 * =====================================================
 */
import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { useT } from '@/lib/i18n/useT';

import { DatabaseSummaryText } from './DatabaseSummaryText';
import { LanguageSelector } from './LanguageSelector';
import { SeasonYearField } from './SeasonYearField';
import { ThemeSelector } from './ThemeSelector';

export function SettingsScreen() {
  const t = useT();

  return (
    <Screen>
      <ScrollView contentContainerClassName="gap-3 pb-6">
        <SectionTitle title={t('settings.appearance')} />
        <LanguageSelector />
        <ThemeSelector />
        <SectionTitle title={t('settings.tournaments')} />
        <SeasonYearField />
        <Button
          label={t('settings.rulePresets')}
          icon="options-outline"
          variant="secondary"
          onPress={() => router.push('/rule-presets')}
        />
        <SectionTitle title={t('settings.data')} />
        <Button
          label={t('backup.title')}
          icon="save-outline"
          variant="secondary"
          onPress={() => router.push('/data-tools')}
        />
        <DatabaseSummaryText />
      </ScrollView>
    </Screen>
  );
}
