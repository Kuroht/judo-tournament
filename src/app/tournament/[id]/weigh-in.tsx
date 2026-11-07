/**
 * =====================================================
 * FILE: weigh-in.tsx
 * PURPOSE: The route for a tournament's weigh-in.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { WeighInScreen } from '@/features/weigh-in';
import { useT } from '@/lib/i18n/useT';

export default function WeighInRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('weighIn.title') }} />
      <WeighInScreen tournamentId={id} />
    </>
  );
}
