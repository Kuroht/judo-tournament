/**
 * =====================================================
 * FILE: edit.tsx
 * PURPOSE: The route for editing a tournament's details.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { TournamentFormScreen } from '@/features/tournaments';
import { useT } from '@/lib/i18n/useT';

export default function EditTournamentRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('tournaments.edit') }} />
      <TournamentFormScreen tournamentId={id} />
    </>
  );
}
