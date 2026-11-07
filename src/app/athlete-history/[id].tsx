/**
 * =====================================================
 * FILE: [id].tsx
 * PURPOSE: The route for one athlete's history.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { AthleteHistoryScreen } from '@/features/results';
import { useT } from '@/lib/i18n/useT';

export default function AthleteHistoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('results.history') }} />
      <AthleteHistoryScreen athleteId={id} />
    </>
  );
}
