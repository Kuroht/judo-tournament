/**
 * =====================================================
 * FILE: ThemedNavigation.tsx
 * PURPOSE: The app's screens, with the navigation and
 *          status bar colors matching the current theme.
 * USED BY: src/app/_layout.tsx
 * =====================================================
 */
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { DARK_NAVIGATION_THEME, LIGHT_NAVIGATION_THEME } from '@/lib/constants/navigationThemes';

export function ThemedNavigation() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DARK_NAVIGATION_THEME : LIGHT_NAVIGATION_THEME}>
      {/* A Stack lets edit screens open on top of the tabs, with a back button. */}
      <Stack
        screenOptions={{ headerTitleStyle: { fontWeight: '700' }, headerShadowVisible: false }}
      >
        {/* The tabs draw their own header, so this one would be a second header. */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
