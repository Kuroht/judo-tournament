/**
 * =====================================================
 * FILE: addMatchFinishedAtMigration.ts
 * PURPOSE: Records when each match finished.
 * USED BY: migrations.ts
 * =====================================================
 */

// The next match is chosen so that nobody fights twice in a row, which needs to know
// which match finished last. Older matches have none, so they're simply not "last".
export const ADD_MATCH_FINISHED_AT_SQL = 'ALTER TABLE matches ADD COLUMN finishedAtMs INTEGER';
