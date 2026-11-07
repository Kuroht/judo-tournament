/**
 * =====================================================
 * FILE: applyThemePreference.ts
 * PURPOSE: Switches the app to the chosen theme.
 * USED BY: useSavedSettings.ts, useThemePreference.ts
 * =====================================================
 */
import { colorScheme } from 'nativewind';
import { Appearance, Platform } from 'react-native';

import type { ThemePreference } from './types';

/**
 * Applies a theme to the whole app.
 * @param preference the trainer's choice
 */
export function applyThemePreference(preference: ThemePreference): void {
  // In a browser, our dark styles only apply when the page has a "dark" class,
  // and choosing "system" removes it even if the computer is in dark mode. So on
  // web we work out the system's theme ourselves. It's only read when the app
  // opens or the option is chosen, which is fine because web is only for testing.
  if (preference === 'system' && Platform.OS === 'web') {
    colorScheme.set(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
    return;
  }

  colorScheme.set(preference);
}
