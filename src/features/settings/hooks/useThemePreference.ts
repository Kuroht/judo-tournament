/**
 * =====================================================
 * FILE: useThemePreference.ts
 * PURPOSE: Reads, changes and saves the chosen theme.
 * USED BY: ThemeSelector.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { applyThemePreference } from '../applyThemePreference';
import { getSavedThemePreference, saveThemePreference } from '../db/settingsQueries';
import type { ThemePreference } from '../types';

/**
 * Gives the current theme choice and a function to change it.
 * @returns the preference (null until it has loaded), and a function that
 *          applies and saves a new one
 */
export function useThemePreference() {
  const db = useSQLiteContext();
  const [preference, setPreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    getSavedThemePreference(db)
      // If the trainer already tapped an option, their choice wins over this read.
      .then((saved) => setPreference((current) => current ?? saved))
      .catch((error: unknown) => {
        console.error('Could not read the theme', error);
      });
  }, [db]);

  function selectPreference(newPreference: ThemePreference) {
    setPreference(newPreference);
    applyThemePreference(newPreference);

    // The new theme already shows, so a failed save only loses it on next launch.
    saveThemePreference(db, newPreference).catch((error: unknown) => {
      console.error('Could not save the theme', error);
    });
  }

  return { preference, selectPreference };
}
