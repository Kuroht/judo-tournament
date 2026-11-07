/**
 * =====================================================
 * FILE: addMatchScreenColumnsMigration.ts
 * PURPOSE: Adds what the match screen needs to save.
 * USED BY: migrations.ts
 * =====================================================
 */

// 1. matchKey names a contest in the bracket, such as "r1-3" or "bronze-1".
// 2. The osaekomi columns let a running hold survive closing the app.
export const ADD_MATCH_SCREEN_COLUMNS_SQL = `
  ALTER TABLE matches ADD COLUMN matchKey TEXT;
  ALTER TABLE matches ADD COLUMN osaekomiSide TEXT;
  ALTER TABLE matches ADD COLUMN osaekomiStartedAtMs INTEGER;
  CREATE UNIQUE INDEX matches_category_key ON matches(categoryId, matchKey);
`;
