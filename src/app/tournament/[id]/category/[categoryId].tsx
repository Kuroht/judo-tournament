/**
 * =====================================================
 * FILE: [categoryId].tsx
 * PURPOSE: The route for editing one category.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoryFormScreen } from '@/features/categories';
import { useT } from '@/lib/i18n/useT';

export default function EditCategoryRoute() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('categories.edit') }} />
      <CategoryFormScreen tournamentId={id} categoryId={categoryId} />
    </>
  );
}
