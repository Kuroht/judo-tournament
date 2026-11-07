/**
 * =====================================================
 * FILE: details.tsx
 * PURPOSE: The route for one category's draw.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoryDrawScreen } from '@/features/draw';
import { useT } from '@/lib/i18n/useT';

export default function CategoryDrawRoute() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('draw.title') }} />
      <CategoryDrawScreen categoryId={categoryId} />
    </>
  );
}
