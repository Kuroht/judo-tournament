/**
 * =====================================================
 * FILE: initDatabase.ts
 * PURPOSE: Prepares the database each time the app opens.
 * USED BY: DatabaseProvider.tsx
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { MIGRATIONS } from './migrations';
import { runMigrations } from './runMigrations';

/** Turns on foreign keys, then applies any waiting migrations. */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  // SQLite leaves foreign keys off by default and forgets this setting on every
  // connection, so it must run on every launch. It also has no effect inside a
  // transaction, so it has to come first.
  await db.execAsync('PRAGMA foreign_keys = ON');
  await runMigrations(db, MIGRATIONS);
}
