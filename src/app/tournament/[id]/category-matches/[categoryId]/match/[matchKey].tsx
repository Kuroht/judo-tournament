/**
 * =====================================================
 * FILE: [matchKey].tsx
 * PURPOSE: The route for one match.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { MatchScreen } from '@/features/matches';
import { useT } from '@/lib/i18n/useT';

export default function MatchRoute() {
  const { categoryId, matchKey } = useLocalSearchParams<{
    categoryId: string;
    matchKey: string;
  }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('matches.matchTitle') }} />
      <MatchScreen categoryId={categoryId} matchKey={matchKey} />
    </>
  );
}
