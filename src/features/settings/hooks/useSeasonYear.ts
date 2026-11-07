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

  useEffect(() => {
    void getSavedSeasonYear(db).then((year) => setText(String(year)));
  }, [db]);

  function change(newText: string) {
    const year = parseSeasonYear(newText);

    setText(newText);
    setIsInvalid(year === null);
    if (year !== null) {
      void saveSeasonYear(db, year);
    }
  }

  return { text, isInvalid, change };
}
