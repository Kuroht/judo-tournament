/**
 * =====================================================
 * FILE: usePrintResults.ts
 * PURPOSE: Reads the latest data and prints it.
 * USED BY: PrintButtons.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { listTournamentContests } from '@/features/matches';
import { useT } from '@/lib/i18n/useT';

import { getTournamentName } from '../db/historyQueries';
import { buildContestsHtml, buildResultsHtml } from '../printing/buildPrintHtml';
import { printDocument } from '../printing/printDocument';

/**
 * Gives a screen the two print actions.
 * @param tournamentId the tournament to print
 */
export function usePrintResults(tournamentId: string) {
  const db = useSQLiteContext();
  const t = useT();
  const [hasFailed, setHasFailed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  async function print(build: typeof buildResultsHtml) {
    setHasFailed(false);
    setIsBusy(true);
    try {
      const name = await getTournamentName(db, tournamentId);
      const categories = await listTournamentContests(db, tournamentId);
      await printDocument(build(name, categories, t));
    } catch {
      setHasFailed(true);
    } finally {
      setIsBusy(false);
    }
  }

  return {
    hasFailed,
    isBusy,
    printResults: () => print(buildResultsHtml),
    printContests: () => print(buildContestsHtml),
  };
}
