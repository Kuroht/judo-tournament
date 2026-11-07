/**
 * =====================================================
 * FILE: [id].tsx
 * PURPOSE: The route for editing one age class's rules.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { RulePresetFormScreen } from '@/features/settings';
import { useT } from '@/lib/i18n/useT';

export default function RulePresetRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('settings.rulePresets') }} />
      <RulePresetFormScreen id={id} />
    </>
  );
}
