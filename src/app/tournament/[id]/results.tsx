/**
 * =====================================================
 * FILE: results.tsx
 * PURPOSE: The route for a tournament's results.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { ResultsScreen } from '@/features/results';
import { useT } from '@/lib/i18n/useT';

export default function ResultsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('results.title') }} />
      <ResultsScreen tournamentId={id} />
    </>
  );
}
