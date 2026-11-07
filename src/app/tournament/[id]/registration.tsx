/**
 * =====================================================
 * FILE: registration.tsx
 * PURPOSE: The route for a tournament's registrations.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { RegistrationScreen } from '@/features/registration';
import { useT } from '@/lib/i18n/useT';

export default function RegistrationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('registration.title') }} />
      <RegistrationScreen tournamentId={id} />
    </>
  );
}
