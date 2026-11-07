/**
 * =====================================================
 * FILE: useSeasonYear.ts
 * PURPOSE: Loads and saves the season year that new
 *          tournaments start with.
 * USED BY: SeasonYearField.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

import { getSavedSeasonYear, saveSeasonYear } from '../db/settingsQueries';
import { parseSeasonYear } from '../validateRulePreset';

/** Gives a screen the season year. It's saved as soon as a valid year is typed. */
export function useSeasonYear() {
  const db = useSQLiteContext();
  const [text, setText] = useState('');
  const [isInvalid, setIsInvalid] = useState(false);
  const [hasSaveFailed, setHasSaveFailed] = useState(false);

  useEffect(() => {
    getSavedSeasonYear(db)
      // Only fills an empty field, so a slow read can't replace what was just typed.
      .then((year) => setText((current) => (current === '' ? String(year) : current)))
      .catch(() => setHasSaveFailed(true));
  }, [db]);

  function change(newText: string) {
    const year = parseSeasonYear(newText);

    setText(newText);
    setIsInvalid(year === null);
    setHasSaveFailed(false);
    if (year !== null) {
      saveSeasonYear(db, year).catch(() => setHasSaveFailed(true));
    }
  }

  return { text, isInvalid, hasSaveFailed, change };
}
