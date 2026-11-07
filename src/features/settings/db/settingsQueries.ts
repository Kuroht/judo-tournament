/**
 * =====================================================
 * FILE: settingsQueries.ts
 * PURPOSE: All the SQL for reading and saving settings.
 * USED BY: useSavedSettings.ts, useThemePreference.ts,
 *          SettingsRoot.tsx, DatabaseSummaryText.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { Language } from '@/lib/i18n/LanguageContext';

import type { DatabaseSummary, ThemePreference } from '../types';

const LANGUAGE_KEY = 'language';
const THEME_KEY = 'theme';
const SEASON_YEAR_KEY = 'seasonYear';

// ---------------------------------------------
// SECTION: Helpers
// ---------------------------------------------

// Stored values are checked rather than trusted, because a JSON import could put
// anything in this table. Anything unexpected falls back to the default.
function isLanguage(value: unknown): value is Language {
  return value === 'pt' || value === 'en';
}

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

async function readSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    [key],
  );

  return row?.value ?? null;
}

async function saveSetting(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT (key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

// ---------------------------------------------
// SECTION: Queries
// ---------------------------------------------

/** Reads the saved language. @returns the language, or 'pt' if none is saved */
export async function getSavedLanguage(db: SQLiteDatabase): Promise<Language> {
  const value = await readSetting(db, LANGUAGE_KEY);

  return isLanguage(value) ? value : 'pt';
}

/**
 * Reads the season year that new tournaments start with.
 * @returns the saved year, or this year if none is saved
 */
export async function getSavedSeasonYear(db: SQLiteDatabase): Promise<number> {
  const value = await readSetting(db, SEASON_YEAR_KEY);
  const year = Number(value);

  return value !== null && Number.isInteger(year) && year > 0 ? year : new Date().getFullYear();
}

/** Saves the season year. */
export function saveSeasonYear(db: SQLiteDatabase, year: number): Promise<void> {
  return saveSetting(db, SEASON_YEAR_KEY, String(year));
}

/** Saves the chosen language. */
export function saveLanguage(db: SQLiteDatabase, language: Language): Promise<void> {
  return saveSetting(db, LANGUAGE_KEY, language);
}

/** Reads the saved theme. @returns the theme, or 'system' if none is saved */
export async function getSavedThemePreference(db: SQLiteDatabase): Promise<ThemePreference> {
  const value = await readSetting(db, THEME_KEY);

  return isThemePreference(value) ? value : 'system';
}

/** Saves the chosen theme. */
export function saveThemePreference(
  db: SQLiteDatabase,
  preference: ThemePreference,
): Promise<void> {
  return saveSetting(db, THEME_KEY, preference);
}

/** Reads the numbers that prove the database was created and filled correctly. */
export async function getDatabaseSummary(db: SQLiteDatabase): Promise<DatabaseSummary> {
  const row = await db.getFirstAsync<DatabaseSummary>(
    `SELECT
       (SELECT MAX(version) FROM schema_version) AS schemaVersion,
       (SELECT COUNT(*) FROM age_classes) AS ageClassCount,
       (SELECT COUNT(*) FROM weight_templates) AS weightCategoryCount`,
  );

  return row ?? { schemaVersion: 0, ageClassCount: 0, weightCategoryCount: 0 };
}
