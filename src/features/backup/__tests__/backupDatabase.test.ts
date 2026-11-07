/**
 * =====================================================
 * FILE: backupDatabase.test.ts
 * PURPOSE: Checks backups against a real SQLite engine with
 *          the app's real tables, because a mistake here
 *          could lose the trainer's data.
 * USED BY: npm test
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import type { MigrationDatabase } from '@/lib/db/migrationTypes';
import { MIGRATIONS } from '@/lib/db/migrations';
import { runMigrations } from '@/lib/db/runMigrations';

import { BACKUP_TABLES } from '../backupTables';
import { addRows, getDatabaseVersion, readAllRows, replaceAllRows } from '../db/backupQueries';

// Tables that are left out on purpose. Language and theme belong to the tablet.
const NOT_IN_BACKUPS = ['schema_version', 'settings'];

// expo-sqlite only runs inside the app, so this gives Node's SQLite the same functions.
async function createDatabase() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');

  const db = {
    execAsync: async (sql: string) => sqlite.exec(sql),
    runAsync: async (sql: string, params: SQLInputValue[] = []) =>
      sqlite.prepare(sql).run(...params),
    getFirstAsync: async (sql: string, params: SQLInputValue[] = []) =>
      sqlite.prepare(sql).get(...params) ?? null,
    getAllAsync: async (sql: string, params: SQLInputValue[] = []) =>
      sqlite.prepare(sql).all(...params),
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
  };

  await runMigrations(db as unknown as MigrationDatabase, MIGRATIONS);

  return { sqlite, db: db as unknown as SQLiteDatabase };
}

/** Adds a tournament with a club, an athlete and a finished match with one event. */
function addSampleTournament(sqlite: DatabaseSync) {
  const ruleSet = sqlite.prepare('SELECT id FROM rule_sets LIMIT 1').get() as { id: string };

  sqlite.exec(`
    INSERT INTO clubs (id, name) VALUES ('club1', 'Clube');
    INSERT INTO athletes (id, name, clubId, birthYear, sex) VALUES ('a1', 'Ana', 'club1', 2010, 'female');
    INSERT INTO tournaments (id, name, date, seasonYear, ruleSetId)
      VALUES ('t1', 'Taça', '2026-11-07', 2026, '${ruleSet.id}');
    INSERT INTO categories (id, tournamentId, sex, label, format)
      VALUES ('c1', 't1', 'female', '-48 kg', 'poule');
    INSERT INTO entries (id, athleteId, categoryId, drawPosition) VALUES ('e1', 'a1', 'c1', 1);
    INSERT INTO draws (id, categoryId, seed, isLocked, entryCount) VALUES ('d1', 'c1', 'ABC', 1, 1);
    INSERT INTO matches (id, categoryId, round, slot, bracketPart, status, matchKey, whiteEntryId)
      VALUES ('m1', 'c1', 0, 0, 'poule', 'finished', 'poule-A-1', 'e1');
    INSERT INTO match_events (id, matchId, sequence, type, side, clockSeconds)
      VALUES ('ev1', 'm1', 1, 'ippon', 'white', 12);
  `);
}

function countAthletes(sqlite: DatabaseSync): number {
  const row = sqlite.prepare('SELECT COUNT(*) AS total FROM athletes').get() as { total: number };

  return row.total;
}

describe('the backup table list', () => {
  it('includes every table in the database', async () => {
    const { sqlite } = await createDatabase();
    const rows = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
      .all() as { name: string }[];
    const tables = rows.map((row) => row.name).filter((name) => !NOT_IN_BACKUPS.includes(name));

    expect(tables.sort()).toEqual(BACKUP_TABLES.map((table) => table.sqlName).sort());
  });

  // This fails if a future migration adds a column that backups would silently lose.
  it.each(BACKUP_TABLES.map((table) => [table.sqlName, table] as const))(
    'lists every column of %s',
    async (sqlName, table) => {
      const { sqlite } = await createDatabase();
      const columns = sqlite.prepare(`PRAGMA table_info(${sqlName})`).all() as { name: string }[];

      expect(columns.map((column) => column.name).sort()).toEqual(
        Object.keys(table.columns).sort(),
      );
    },
  );

  it('accepts null only where the table does, for required columns', async () => {
    const { sqlite } = await createDatabase();

    for (const table of BACKUP_TABLES) {
      const columns = sqlite.prepare(`PRAGMA table_info(${table.sqlName})`).all() as {
        name: string;
        notnull: number;
      }[];

      for (const column of columns) {
        const kind = table.columns[column.name] ?? '';
        if (column.notnull === 1) {
          expect(`${table.key}.${column.name} ${kind.endsWith('OrNull')}`).toBe(
            `${table.key}.${column.name} false`,
          );
        }
      }
    }
  });
});

describe('reading and writing', () => {
  it('finds the database version', async () => {
    const { db } = await createDatabase();

    expect(await getDatabaseVersion(db)).toBe(MIGRATIONS.length);
  });

  it('gets back exactly the same data after replacing everything with it', async () => {
    const { sqlite, db } = await createDatabase();
    addSampleTournament(sqlite);
    const before = await readAllRows(db);

    await replaceAllRows(db, before);

    expect(await readAllRows(db)).toEqual(before);
    expect(before.matchEvents).toHaveLength(1);
  });

  it('removes what is not in the file when replacing', async () => {
    const { sqlite, db } = await createDatabase();
    const empty = await readAllRows(db);
    addSampleTournament(sqlite);

    await replaceAllRows(db, empty);

    expect(countAthletes(sqlite)).toBe(0);
  });

  it('restores everything into a new, empty database', async () => {
    const first = await createDatabase();
    addSampleTournament(first.sqlite);
    const data = await readAllRows(first.db);
    const second = await createDatabase();

    await replaceAllRows(second.db, data);

    expect(await readAllRows(second.db)).toEqual(data);
  });
});

describe('when something goes wrong', () => {
  it('changes nothing if replacing fails halfway', async () => {
    const { sqlite, db } = await createDatabase();
    addSampleTournament(sqlite);
    const before = await readAllRows(db);
    const broken = {
      ...before,
      entries: before.entries.map((row) => ({ ...row, athleteId: 'nobody' })),
    };

    await expect(replaceAllRows(db, broken)).rejects.toThrow();

    expect(await readAllRows(db)).toEqual(before);
  });

  it('changes nothing if a merge fails halfway', async () => {
    const { sqlite, db } = await createDatabase();
    const before = await readAllRows(db);
    const broken = {
      ...before,
      ruleSets: [],
      ageClasses: [],
      weightTemplates: [],
      clubs: [{ id: 'new-club', name: 'Should not stay' }],
      athletes: [
        {
          id: 'new-athlete',
          name: 'x',
          clubId: 'missing-club',
          birthYear: 2010,
          sex: 'male',
          belt: null,
          notes: null,
        },
      ],
    };

    await expect(addRows(db, broken)).rejects.toThrow();

    const clubs = sqlite.prepare('SELECT COUNT(*) AS total FROM clubs').get() as { total: number };
    expect(clubs.total).toBe(0);
    expect(countAthletes(sqlite)).toBe(0);
  });
});
