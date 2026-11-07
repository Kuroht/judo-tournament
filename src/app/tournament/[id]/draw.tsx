/**
 * =====================================================
 * FILE: draw.tsx
 * PURPOSE: The route for a tournament's draws.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { DrawScreen } from '@/features/draw';
import { useT } from '@/lib/i18n/useT';

export default function DrawRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('draw.title') }} />
      <DrawScreen tournamentId={id} />
    </>
  );
}
