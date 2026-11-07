/**
 * =====================================================
 * FILE: new.tsx
 * PURPOSE: The route for adding a category by hand.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoryFormScreen } from '@/features/categories';
import { useT } from '@/lib/i18n/useT';

export default function NewCategoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('categories.addManually') }} />
      <CategoryFormScreen tournamentId={id} categoryId={null} />
    </>
  );
}
