/**
 * =====================================================
 * FILE: [id].tsx
 * PURPOSE: The route for editing one athlete. The file's
 *          [id] name means the id comes from the address.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { AthleteFormScreen } from '@/features/athletes';
import { useT } from '@/lib/i18n/useT';

export default function EditAthleteRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('athletes.edit') }} />
      <AthleteFormScreen athleteId={id} />
    </>
  );
}
