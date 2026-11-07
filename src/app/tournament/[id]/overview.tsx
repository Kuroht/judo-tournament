/**
 * =====================================================
 * FILE: overview.tsx
 * PURPOSE: The route for one tournament's home screen.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { TournamentOverviewScreen } from '@/features/tournaments';
import { useT } from '@/lib/i18n/useT';

export default function TournamentOverviewRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('tournaments.overview') }} />
      <TournamentOverviewScreen tournamentId={id} />
    </>
  );
}
