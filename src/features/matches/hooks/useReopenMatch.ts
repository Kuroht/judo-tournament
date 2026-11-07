/**
 * =====================================================
 * FILE: useReopenMatch.ts
 * PURPOSE: Reopens a finished match so that its result
 *          can be corrected.
 * USED BY: ReopenMatchButton.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';

import { reopenMatch } from '../db/matchQueries';

/**
 * Gives a screen the action that reopens a match.
 * @param matchId the match to reopen
 * @param reload reads the saved match again
 */
export function useReopenMatch(matchId: string, reload: () => Promise<void>) {
  const db = useSQLiteContext();
  const [hasFailed, setHasFailed] = useState(false);

  async function reopen() {
    setHasFailed(false);
    try {
      await reopenMatch(db, matchId);
      await reload();
    } catch {
      setHasFailed(true);
    }
  }

  return { reopen, hasFailed };
}
