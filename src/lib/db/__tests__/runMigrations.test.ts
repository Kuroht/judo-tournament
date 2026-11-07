/**
 * =====================================================
 * FILE: runMigrations.test.ts
 * PURPOSE: Checks migrations against a real SQLite engine,
 *          because a bad one could damage the trainer's data.
 * USED BY: npm test
 * =====================================================
 */
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import type { Migration, MigrationDatabase } from '../migrationTypes';
import { MIGRATIONS } from '../migrations';
import { runMigrations } from '../runMigrations';

// ---------------------------------------------
// SECTION: Helpers
// ---------------------------------------------

// expo-sqlite only runs inside the app, and Node has its own SQLite built in. This
// gives Node's version the same functions, so the migrations run unchanged.
function createTestDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');

  const db = {
    execAsync: async (sql: string) => sqlite.exec(sql),
    runAsync: async (sql: string, params: SQLInputValue[] = []) =>
      sqlite.prepare(sql).run(...params),
    getFirstAsync: async (sql: string) => sqlite.prepare(sql).get() ?? null,
    withTransactionAsync: async (task: () => Promise<void>) => {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
  } as unknown as MigrationDatabase;

  return { sqlite, db };
}

function countRows(sqlite: DatabaseSync, table: string): number {
  const row = sqlite.prepare(`SELECT COUNT(*) AS total FROM ${table}`).get() as { total: number };

  return row.total;
}

const LATEST_VERSION = MIGRATIONS.length;

// ---------------------------------------------
// SECTION: Tests
// ---------------------------------------------

describe('runMigrations', () => {
  it('builds a new database and fills it with the FPJ data', async () => {
    const { sqlite, db } = createTestDatabase();

    expect(await runMigrations(db, MIGRATIONS)).toBe(LATEST_VERSION);
    expect(countRows(sqlite, 'rule_sets')).toBe(1);
    expect(countRows(sqlite, 'age_classes')).toBe(10);
    expect(countRows(sqlite, 'weight_templates')).toBe(104);
  });

  it('changes nothing when run a second time', async () => {
    const { sqlite, db } = createTestDatabase();
    await runMigrations(db, MIGRATIONS);
    await runMigrations(db, MIGRATIONS);

    expect(countRows(sqlite, 'weight_templates')).toBe(104);
    expect(countRows(sqlite, 'schema_version')).toBe(LATEST_VERSION);
  });

  it('upgrades an older database and keeps its data', async () => {
    const { sqlite, db } = createTestDatabase();
    await runMigrations(db, MIGRATIONS.slice(0, 2));
    sqlite.exec(`INSERT INTO clubs VALUES ('club-1', 'Kept')`);

    await runMigrations(db, MIGRATIONS);

    expect(countRows(sqlite, 'clubs')).toBe(1);
  });

  it('undoes a failed migration completely, and keeps the ones before it', async () => {
    const { sqlite, db } = createTestDatabase();
    const migrations: Migration[] = [
      { version: 1, run: (database) => database.execAsync('CREATE TABLE first_table (id TEXT)') },
      {
        version: 2,
        run: async (database) => {
          await database.execAsync('CREATE TABLE second_table (id TEXT)');
          throw new Error('Something failed');
        },
      },
    ];

    await expect(runMigrations(db, migrations)).rejects.toThrow('Something failed');

    expect(countRows(sqlite, 'first_table')).toBe(0);
    expect(() => countRows(sqlite, 'second_table')).toThrow();
    expect(countRows(sqlite, 'schema_version')).toBe(1);
  });

  it('refuses a database from a newer version of the app', async () => {
    const { db } = createTestDatabase();
    await runMigrations(db, MIGRATIONS);

    await expect(runMigrations(db, MIGRATIONS.slice(0, 1))).rejects.toThrow('newer');
  });
});
