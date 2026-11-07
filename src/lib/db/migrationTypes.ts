/**
 * =====================================================
 * FILE: migrationTypes.ts
 * PURPOSE: Types shared by the migration files.
 * USED BY: migrations.ts, runMigrations.ts,
 *          seedFpjDataMigration.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

/** The only database functions migrations are allowed to use. */
export type MigrationDatabase = Pick<
  SQLiteDatabase,
  'execAsync' | 'runAsync' | 'getFirstAsync' | 'withTransactionAsync'
>;

/** One numbered, permanent change to the database. */
export type Migration = {
  version: number;
  run: (db: MigrationDatabase) => Promise<void>;
};
