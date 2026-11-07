/**
 * =====================================================
 * FILE: mergeBackup.ts
 * PURPOSE: Works out what a merge adds. The rule for
 *          duplicate ids: what is on this tablet always stays.
 * USED BY: useDataTools.ts
 * =====================================================
 */
import { type BackupData, type BackupRow, type BackupTableKey } from './backupTables';

export type MergePlan = {
  // Only the rows to insert. Nothing on this tablet is changed or removed.
  toAdd: BackupData;
  skippedTournaments: number;
};

function idsOf(rows: readonly BackupRow[]): Set<BackupRow[string]> {
  return new Set(rows.map((row) => row.id));
}

/**
 * Works out a merge. A club, athlete or rule that already exists is kept as it is. A
 * tournament that already exists is skipped whole, with all its categories and matches,
 * because mixing two versions of one tournament could break its bracket.
 * @param existing what is on this tablet
 * @param incoming what is in the file
 * @returns what to insert, and how many tournaments were skipped
 */
export function mergeBackup(existing: BackupData, incoming: BackupData): MergePlan {
  const onlyNew = (key: BackupTableKey) => {
    const existingIds = idsOf(existing[key]);

    return incoming[key].filter((row) => !existingIds.has(row.id));
  };

  const tournaments = onlyNew('tournaments');
  const tournamentIds = idsOf(tournaments);
  const categories = incoming.categories.filter((row) => tournamentIds.has(row.tournamentId));
  const categoryIds = idsOf(categories);
  const matches = incoming.matches.filter((row) => categoryIds.has(row.categoryId));
  const matchIds = idsOf(matches);

  const toAdd: BackupData = {
    ruleSets: onlyNew('ruleSets'),
    ageClasses: onlyNew('ageClasses'),
    weightTemplates: onlyNew('weightTemplates'),
    clubs: onlyNew('clubs'),
    athletes: onlyNew('athletes'),
    tournaments,
    categories,
    entries: incoming.entries.filter((row) => categoryIds.has(row.categoryId)),
    draws: incoming.draws.filter((row) => categoryIds.has(row.categoryId)),
    matches,
    matchEvents: incoming.matchEvents.filter((row) => matchIds.has(row.matchId)),
  };

  return { toAdd, skippedTournaments: incoming.tournaments.length - tournaments.length };
}
