/**
 * =====================================================
 * FILE: clubs.tsx
 * PURPOSE: The route for the list of clubs.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack } from 'expo-router';

import { ClubsScreen } from '@/features/clubs';
import { useT } from '@/lib/i18n/useT';

export default function ClubsRoute() {
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('clubs.title') }} />
      <ClubsScreen />
    </>
  );
}
