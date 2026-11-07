/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types used only by the settings feature.
 * USED BY: settingsQueries.ts, useThemePreference.ts,
 *          ThemeSelector.tsx
 * =====================================================
 */

export type ThemePreference = 'system' | 'light' | 'dark';

/** The rules that can be changed for an age class. */
export type RulePresetRules = {
  matchSeconds: number;
  hasGoldenScore: boolean;
  // Null means golden score has no time limit.
  goldenScoreMaxSeconds: number | null;
  isYukoEnabled: boolean;
  weightToleranceGrams: number;
};

/** One age class with its rules. */
export type RulePreset = RulePresetRules & {
  id: string;
  name: string;
};

/** The rule form's fields. Numbers are text while they're being typed. */
export type RulePresetFormValues = {
  matchSeconds: string;
  hasGoldenScore: boolean;
  goldenScoreMaxSeconds: string;
  isYukoEnabled: boolean;
  weightToleranceGrams: string;
};

/** The numbers shown in the database summary on the settings screen. */
export type DatabaseSummary = {
  schemaVersion: number;
  ageClassCount: number;
  weightCategoryCount: number;
};
