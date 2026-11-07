/**
 * =====================================================
 * FILE: _layout.tsx
 * PURPOSE: The root of the app. Loads the styles and wraps
 *          every screen in the database and settings.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import '@/global.css';

import type { ErrorBoundaryProps } from 'expo-router';
import { Platform } from 'react-native';

import { AppErrorScreen } from '@/components/AppErrorScreen';
import { ThemedNavigation } from '@/components/ThemedNavigation';
import { SettingsRoot } from '@/features/settings';
import { DatabaseProvider } from '@/lib/db/DatabaseProvider';

// Expo Router shows this instead of the app if any screen below fails unexpectedly.
// It must be named ErrorBoundary and exported from this file for the router to find it.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  function handleRetry() {
    // In a browser, SQLite's background worker can't start twice in one page, so
    // only loading the page again can recover. Android and iOS can retry in place.
    if (Platform.OS === 'web') {
      globalThis.location.reload();
      return;
    }

    void retry();
  }

  return <AppErrorScreen message={error.message} onRetry={handleRetry} />;
}

export default function RootLayout() {
  return (
    <DatabaseProvider>
      <SettingsRoot>
        <ThemedNavigation />
      </SettingsRoot>
    </DatabaseProvider>
  );
}
