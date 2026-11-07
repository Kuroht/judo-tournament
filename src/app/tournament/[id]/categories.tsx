/**
 * =====================================================
 * FILE: categories.tsx
 * PURPOSE: The route for a tournament's categories.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoriesScreen } from '@/features/categories';
import { useT } from '@/lib/i18n/useT';

export default function CategoriesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('categories.title') }} />
      <CategoriesScreen tournamentId={id} />
    </>
  );
}
