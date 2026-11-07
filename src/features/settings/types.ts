/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types used only by the settings feature.
 * USED BY: settingsQueries.ts, useThemePreference.ts,
 *          ThemeSelector.tsx
 * =====================================================
 */

export type ThemePreference = 'system' | 'light' | 'dark';

/** The numbers shown in the database summary on the settings screen. */
export type DatabaseSummary = {
  schemaVersion: number;
  ageClassCount: number;
  weightCategoryCount: number;
};
