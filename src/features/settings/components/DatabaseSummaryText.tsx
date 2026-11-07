/**
 * =====================================================
 * FILE: DatabaseSummaryText.tsx
 * PURPOSE: Shows that the database exists and was filled
 *          with the FPJ data.
 * USED BY: SettingsScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { useT } from '@/lib/i18n/useT';

import { getDatabaseSummary } from '../db/settingsQueries';
import type { DatabaseSummary } from '../types';

export function DatabaseSummaryText() {
  const db = useSQLiteContext();
  const t = useT();
  const [summary, setSummary] = useState<DatabaseSummary | null>(null);

  useEffect(() => {
    getDatabaseSummary(db)
      .then(setSummary)
      .catch((error: unknown) => {
        console.error('Could not read the database summary', error);
      });
  }, [db]);

  if (summary === null) {
    return null;
  }

  return (
    <Text className="text-base text-stone-700 dark:text-stone-200">
      {`${t('settings.database')}: v${summary.schemaVersion} · ${summary.ageClassCount} ${t('settings.database.ageClasses')} · ${summary.weightCategoryCount} ${t('settings.database.weightCategories')}`}
    </Text>
  );
}
