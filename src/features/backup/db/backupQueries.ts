/**
 * =====================================================
 * FILE: backupQueries.ts
 * PURPOSE: Reads the whole database for a backup, and
 *          writes a backup into it.
 * USED BY: useDataTools.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { BACKUP_TABLES, type BackupData, type BackupRow } from '../backupTables';

export type TournamentChoice = {
  id: string;
  name: string;
  date: string;
};

/** Lists the tournaments that can be exported, newest first. */
export async function listTournamentChoices(db: SQLiteDatabase): Promise<TournamentChoice[]> {
  return db.getAllAsync<TournamentChoice>(
    'SELECT id, name, date FROM tournaments ORDER BY date DESC, name',
  );
}

/** Finds the version of this database, which goes in every backup. */
export async function getDatabaseVersion(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) AS version FROM schema_version',
  );

  return row?.version ?? 0;
}

/**
 * Reads every table that goes in a backup. In one transaction, so that the tables all
 * show the same moment and the file can always be restored.
 */
export async function readAllRows(db: SQLiteDatabase): Promise<BackupData> {
  const data = {} as BackupData;

  await db.withTransactionAsync(async () => {
    for (const table of BACKUP_TABLES) {
      const columns = Object.keys(table.columns).join(', ');
      // The table and column names come from BACKUP_TABLES, never from a file.
      data[table.key] = await db.getAllAsync<BackupRow>(`SELECT ${columns} FROM ${table.sqlName}`);
    }
  });

  return data;
}

/** Inserts every row given, parents first. */
async function insertRows(db: SQLiteDatabase, data: BackupData): Promise<void> {
  for (const table of BACKUP_TABLES) {
    const columns = Object.keys(table.columns);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table.sqlName} (${columns.join(', ')}) VALUES (${placeholders})`;

    for (const row of data[table.key]) {
      await db.runAsync(
        sql,
        columns.map((column) => row[column] ?? null),
      );
    }
  }
}

/**
 * Adds rows to the database. All or nothing, so a failure changes nothing.
 * @throws if a row can't be inserted, such as one that refers to something missing
 */
export async function addRows(db: SQLiteDatabase, data: BackupData): Promise<void> {
  await db.withTransactionAsync(() => insertRows(db, data));
}

/**
 * Replaces everything in the database. All or nothing, so a failure changes nothing.
 * Language and theme stay, because they belong to the tablet and aren't in a backup.
 * @throws if a row can't be inserted, such as one that refers to something missing
 */
export async function replaceAllRows(db: SQLiteDatabase, data: BackupData): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of [...BACKUP_TABLES].reverse()) {
      await db.runAsync(`DELETE FROM ${table.sqlName}`);
    }
    await insertRows(db, data);
  });
}
