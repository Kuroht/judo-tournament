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

import { listTournamentContests } from '@/features/matches';
import { useFocusQuery } from '@/hooks/useFocusQuery';
import { useT } from '@/lib/i18n/useT';

import {
  duplicateTournament,
  getDrawCounts,
  getTournament,
  setTournamentArchived,
} from '../db/tournamentQueries';
import type { TournamentProgress } from '../tournamentSteps';
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
    async (database: SQLiteDatabase) => {
      const details = await getTournament(database, tournamentId);
      if (details === null) {
        return null;
      }

      const drawCounts = await getDrawCounts(database, tournamentId);
      const categories = await listTournamentContests(database, tournamentId);
      const contests = categories.flatMap((category) => category.contests);
      const progress: TournamentProgress = {
        categoryCount: details.categoryCount,
        entryCount: details.entryCount,
        weighInDoneCount: details.weighInDoneCount,
        ...drawCounts,
        finishedMatchCount: contests.filter((contest) => contest.isFinished).length,
        totalMatchCount: contests.length,
      };

      return { details, progress };
    },
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
