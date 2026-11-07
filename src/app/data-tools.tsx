/**
 * =====================================================
 * FILE: data-tools.tsx
 * PURPOSE: The route for exporting and importing data.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Stack } from 'expo-router';

import { DataToolsScreen } from '@/features/backup';
import { useT } from '@/lib/i18n/useT';

export default function DataToolsRoute() {
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t('backup.title') }} />
      <DataToolsScreen />
    </>
  );
}
