/**
 * =====================================================
 * FILE: addMatchRulesMigration.ts
 * PURPOSE: Lets each match keep a copy of its rules.
 * USED BY: migrations.ts
 * =====================================================
 */

// Without this, changing an age class's rules would change how matches already fought
// are replayed, so one could show a different result from the one saved.
export const ADD_MATCH_RULES_SQL = 'ALTER TABLE matches ADD COLUMN rulesJson TEXT';
