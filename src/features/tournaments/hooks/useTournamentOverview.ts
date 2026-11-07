/**
 * =====================================================
 * FILE: useTournamentOverview.ts
 * PURPOSE: Loads one tournament, and duplicates or archives
 *          it.
 * USED BY: TournamentOverviewScreen.tsx
 * =====================================================
 */
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

import { useFocusQuery } from '@/hooks/useFocusQuery';
import { useT } from '@/lib/i18n/useT';

import { duplicateTournament, getTournament, setTournamentArchived } from '../db/tournamentQueries';
import type { Tournament } from '../types';

/**
 * Gives a screen one tournament and its actions.
 * @param tournamentId the tournament to show
 * @param onDuplicated called with the new tournament's id
 * @param onArchiveChanged called after archiving or restoring
 */
export function useTournamentOverview(
  tournamentId: string,
  onDuplicated: (id: string) => void,
  onArchiveChanged: () => void,
) {
  const db = useSQLiteContext();
  const t = useT();
  const [hasActionFailed, setHasActionFailed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  // A ref changes at once, so a fast second tap can't create two copies.
  const isActionRunning = useRef(false);

  const query = useCallback(
    (database: SQLiteDatabase) => getTournament(database, tournamentId),
    [tournamentId],
  );
  const tournament = useFocusQuery(query);

  async function run(action: () => Promise<void>) {
    if (isActionRunning.current) {
      return;
    }

    isActionRunning.current = true;
    setHasActionFailed(false);
    setIsBusy(true);
    try {
      await action();
    } catch {
      setHasActionFailed(true);
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  function duplicate(source: Tournament) {
    return run(async () => {
      const name = t('tournaments.copyName', { name: source.name });
      onDuplicated(await duplicateTournament(db, source, name));
    });
  }

  function setArchived(isArchived: boolean) {
    return run(async () => {
      await setTournamentArchived(db, tournamentId, isArchived);
      onArchiveChanged();
    });
  }

  return { tournament, hasActionFailed, isBusy, duplicate, setArchived };
}
