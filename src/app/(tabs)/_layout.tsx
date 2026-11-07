/**
 * =====================================================
 * FILE: _layout.tsx
 * PURPOSE: The bottom tab bar: tournaments, athletes and
 *          settings.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { Tabs } from 'expo-router';

import { useT } from '@/lib/i18n/useT';

export default function TabsLayout() {
  const t = useT();

  return (
    <Tabs
      screenOptions={{
        // Text-only tabs: large labels are easy to read at arm's length,
        // and we avoid adding an icon package.
        tabBarIconStyle: { display: 'none' },
        // The margins are meant for an icon beside the label, so we remove them.
        tabBarLabelStyle: { fontSize: 16, fontWeight: '600', marginStart: 0, marginEnd: 0 },
        tabBarLabelPosition: 'beside-icon',
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.tournaments') }} />
      <Tabs.Screen name="athletes" options={{ title: t('tabs.athletes') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
