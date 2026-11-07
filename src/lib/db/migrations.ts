/**
 * =====================================================
 * FILE: migrations.ts
 * PURPOSE: The ordered list of every change ever made to
 *          the database.
 * USED BY: initDatabase.ts
 * =====================================================
 */
import { ADD_DRAW_ENTRY_COUNT_SQL } from './addDrawEntryCountMigration';
import { ADD_MATCH_SCREEN_COLUMNS_SQL } from './addMatchScreenColumnsMigration';
import { confirmYouthAgeClasses } from './confirmYouthAgeClassesMigration';
import { CREATE_TABLES_SQL } from './createTablesMigration';
import type { Migration } from './migrationTypes';
import { seedFpjData } from './seedFpjDataMigration';

// RULE: never edit a migration after the app has been used, because the trainer's
// tablet has already run it. To change the database, add a new one at the end.
export const MIGRATIONS: readonly Migration[] = [
  { version: 1, run: (db) => db.execAsync(CREATE_TABLES_SQL) },
  { version: 2, run: seedFpjData },
  { version: 3, run: confirmYouthAgeClasses },
  { version: 4, run: (db) => db.execAsync(ADD_DRAW_ENTRY_COUNT_SQL) },
  { version: 5, run: (db) => db.execAsync(ADD_MATCH_SCREEN_COLUMNS_SQL) },
];
