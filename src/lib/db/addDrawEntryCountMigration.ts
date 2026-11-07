/**
 * =====================================================
 * FILE: addDrawEntryCountMigration.ts
 * PURPOSE: Remembers how many athletes a draw was made for.
 * USED BY: migrations.ts
 * =====================================================
 */

// Without this, removing the athlete in the last position would look unchanged, because
// the remaining positions still run from 1 with no gaps. Existing draws are left
// without a count, so they show as out of date and are drawn again.
export const ADD_DRAW_ENTRY_COUNT_SQL = 'ALTER TABLE draws ADD COLUMN entryCount INTEGER';
