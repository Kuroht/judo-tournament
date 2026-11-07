/**
 * =====================================================
 * FILE: add.tsx
 * PURPOSE: The route for adding athletes to one category.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { AddAthletesScreen } from '@/features/registration';
import { useT } from '@/lib/i18n/useT';

export default function AddAthletesRoute() {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('registration.addAthletes') }} />
      <AddAthletesScreen categoryId={categoryId} />
    </>
  );
}
