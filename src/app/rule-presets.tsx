/**
 * =====================================================
 * FILE: rule-presets.tsx
 * PURPOSE: The route for the list of age classes' rules.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack } from 'expo-router';

import { RulePresetsScreen } from '@/features/settings';
import { useT } from '@/lib/i18n/useT';

export default function RulePresetsRoute() {
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('settings.rulePresets') }} />
      <RulePresetsScreen />
    </>
  );
}
