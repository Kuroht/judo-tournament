/**
 * =====================================================
 * FILE: new.tsx
 * PURPOSE: The route for adding a club.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack } from 'expo-router';

import { ClubFormScreen } from '@/features/clubs';
import { useT } from '@/lib/i18n/useT';

export default function NewClubRoute() {
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('clubs.add') }} />
      <ClubFormScreen clubId={null} />
    </>
  );
}
