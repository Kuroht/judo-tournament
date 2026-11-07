/**
 * =====================================================
 * FILE: [id].tsx
 * PURPOSE: The route for editing one club. The file's [id]
 *          name means the id comes from the address.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack, useLocalSearchParams } from 'expo-router';

import { ClubFormScreen } from '@/features/clubs';
import { useT } from '@/lib/i18n/useT';

export default function EditClubRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('clubs.edit') }} />
      <ClubFormScreen clubId={id} />
    </>
  );
}
