/**
 * =====================================================
 * FILE: new.tsx
 * PURPOSE: The route for adding an athlete.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack } from 'expo-router';

import { AthleteFormScreen } from '@/features/athletes';
import { useT } from '@/lib/i18n/useT';

export default function NewAthleteRoute() {
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('athletes.add') }} />
      <AthleteFormScreen athleteId={null} />
    </>
  );
}
