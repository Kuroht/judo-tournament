/**
 * =====================================================
 * FILE: useSavedSettings.ts
 * PURPOSE: Loads the saved language and applies the saved
 *          theme once, when the app opens.
 * USED BY: SettingsRoot.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import type { Language } from '@/lib/i18n/LanguageContext';

import { applyThemePreference } from '../applyThemePreference';
import { getSavedLanguage, getSavedThemePreference } from '../db/settingsQueries';

type SavedSettings = { type: 'loading' } | { type: 'ready'; language: Language };

/**
 * Reads the saved settings from the database.
 * @returns 'loading' at first, then 'ready' with the language to start in.
 * If reading fails, the app still opens using the default language and theme.
 */
export function useSavedSettings(): SavedSettings {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<SavedSettings>({ type: 'loading' });

  useEffect(() => {
    async function load() {
      try {
        const [language, theme] = await Promise.all([
          getSavedLanguage(db),
          getSavedThemePreference(db),
        ]);
        applyThemePreference(theme);
        setSettings({ type: 'ready', language });
      } catch (error: unknown) {
        console.error('Could not load the saved settings', error);
        setSettings({ type: 'ready', language: 'pt' });
      }
    }

    void load();
  }, [db]);

  return settings;
}
