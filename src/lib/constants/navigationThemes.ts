/**
 * =====================================================
 * FILE: navigationThemes.ts
 * PURPOSE: The colors of the header and tab bar, and of
 *          icons, which can't use Tailwind classes.
 * USED BY: ThemedNavigation.tsx, AppIcon.tsx
 * =====================================================
 */
import { DarkTheme, DefaultTheme } from 'expo-router';

// ---------------------------------------------
// SECTION: Themes
// ---------------------------------------------

// The header and tab bar are drawn by the navigation library, not by us,
// so they can't use Tailwind classes. The backgrounds match the classes
// used by the Screen component (bg-stone-100 and dark:bg-stone-900).
export const LIGHT_NAVIGATION_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#B3261E',
    background: '#F6F1E7',
    // card is the header and tab bar background (stone-50).
    card: '#FDFBF6',
    text: '#1A1612',
    border: '#E8E0D1',
  },
};

export const DARK_NAVIGATION_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#F2A79F',
    background: '#1A1612',
    // card is the header and tab bar background (stone-800).
    card: '#2A251F',
    text: '#F6F1E7',
    border: '#453E35',
  },
};
