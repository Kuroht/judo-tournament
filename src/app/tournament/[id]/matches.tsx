/**
 * =====================================================
 * FILE: matches.tsx
 * PURPOSE: The route for a tournament's match list.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { MatchListScreen } from '@/features/matches';
import { useT } from '@/lib/i18n/useT';

export default function MatchListRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('matches.title') }} />
      <MatchListScreen tournamentId={id} />
    </>
  );
}
