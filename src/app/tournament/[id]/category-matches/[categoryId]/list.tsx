/**
 * =====================================================
 * FILE: list.tsx
 * PURPOSE: The route for one category's contests.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoryContestsScreen } from '@/features/matches';
import { useT } from '@/lib/i18n/useT';

export default function CategoryContestsRoute() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('matches.title') }} />
      <CategoryContestsScreen tournamentId={id} categoryId={categoryId} />
    </>
  );
}
