/**
 * =====================================================
 * FILE: navigationThemes.ts
 * PURPOSE: Colors for the header and tab bar in light and
 *          dark mode.
 * USED BY: src/app/_layout.tsx
 * =====================================================
 */
import { DarkTheme, DefaultTheme } from 'expo-router';

// ---------------------------------------------
// SECTION: Themes
// ---------------------------------------------

// The header and tab bar are drawn by the navigation library, not by us,
// so they can't use Tailwind classes. The backgrounds match the classes
// used by the Screen component (bg-slate-100 and dark:bg-slate-900).
export const LIGHT_NAVIGATION_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1D4ED8',
    background: '#F1F5F9',
  },
};

export const DARK_NAVIGATION_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#93C5FD',
    background: '#0F172A',
    // card is the header and tab bar background (slate-800).
    card: '#1E293B',
    border: '#334155',
  },
};
