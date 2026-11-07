/**
 * =====================================================
 * FILE: index.ts
 * PURPOSE: The public API of the settings feature. Other
 *          code imports from here, never from its insides.
 * USED BY: src/app/_layout.tsx, src/app/(tabs)/settings.tsx
 * =====================================================
 */
export { RulePresetFormScreen } from './components/RulePresetFormScreen';
export { RulePresetsScreen } from './components/RulePresetsScreen';
export { SettingsRoot } from './components/SettingsRoot';
export { SettingsScreen } from './components/SettingsScreen';
export { getSavedSeasonYear } from './db/settingsQueries';
