/**
 * =====================================================
 * FILE: new.tsx
 * PURPOSE: The route for adding a tournament.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack } from 'expo-router';

import { TournamentFormScreen } from '@/features/tournaments';
import { useT } from '@/lib/i18n/useT';

export default function NewTournamentRoute() {
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('tournaments.add') }} />
      <TournamentFormScreen tournamentId={null} />
    </>
  );
}
