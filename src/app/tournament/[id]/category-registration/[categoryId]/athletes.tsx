/**
 * =====================================================
 * FILE: athletes.tsx
 * PURPOSE: The route for the athletes in one category.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { CategoryRegistrationScreen } from '@/features/registration';
import { useT } from '@/lib/i18n/useT';

export default function CategoryRegistrationRoute() {
  const { id, categoryId } = useLocalSearchParams<{ id: string; categoryId: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('registration.title') }} />
      <CategoryRegistrationScreen tournamentId={id} categoryId={categoryId} />
    </>
  );
}
