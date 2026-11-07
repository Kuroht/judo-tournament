/**
 * =====================================================
 * FILE: add-categories.tsx
 * PURPOSE: The route for adding categories from the FPJ
 *          age classes.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { AddFpjCategoriesScreen } from '@/features/categories';
import { useT } from '@/lib/i18n/useT';

export default function AddCategoriesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('categories.addFromFpj') }} />
      <AddFpjCategoriesScreen tournamentId={id} />
    </>
  );
}
