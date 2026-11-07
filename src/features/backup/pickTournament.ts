/**
 * =====================================================
 * FILE: pickTournament.ts
 * PURPOSE: Cuts a full backup down to one tournament,
 *          keeping everything that tournament needs.
 * USED BY: useDataTools.ts
 * =====================================================
 */
import type { BackupData, BackupRow } from './backupTables';

/**
 * Picks one tournament with its athletes, clubs, categories and matches, and the rules
 * and age classes they refer to. Without those, the file couldn't be imported elsewhere.
 * @param data everything in the database
 * @param tournamentId the tournament to keep
 * @returns the smaller data
 */
export function pickTournament(data: BackupData, tournamentId: string): BackupData {
  const has = (values: Set<BackupRow[string]>, value: BackupRow[string]) => values.has(value);

  const tournaments = data.tournaments.filter((row) => row.id === tournamentId);
  const categories = data.categories.filter((row) => row.tournamentId === tournamentId);
  const categoryIds = new Set(categories.map((row) => row.id));
  const entries = data.entries.filter((row) => has(categoryIds, row.categoryId ?? null));
  const matches = data.matches.filter((row) => has(categoryIds, row.categoryId ?? null));
  const matchIds = new Set(matches.map((row) => row.id));

  const athleteIds = new Set(entries.map((row) => row.athleteId));
  const athletes = data.athletes.filter((row) => has(athleteIds, row.id ?? null));
  const clubIds = new Set(athletes.map((row) => row.clubId));
  const ruleSetIds = new Set(tournaments.map((row) => row.ruleSetId));
  const ageClassIds = new Set(categories.map((row) => row.ageClassId));

  return {
    ruleSets: data.ruleSets.filter((row) => has(ruleSetIds, row.id ?? null)),
    ageClasses: data.ageClasses.filter((row) => has(ageClassIds, row.id ?? null)),
    weightTemplates: data.weightTemplates.filter((row) => has(ageClassIds, row.ageClassId ?? null)),
    clubs: data.clubs.filter((row) => has(clubIds, row.id ?? null)),
    athletes,
    tournaments,
    categories,
    entries,
    draws: data.draws.filter((row) => has(categoryIds, row.categoryId ?? null)),
    matches,
    matchEvents: data.matchEvents.filter((row) => has(matchIds, row.matchId ?? null)),
  };
}
