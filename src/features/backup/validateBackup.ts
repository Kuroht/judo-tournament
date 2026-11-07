/**
 * =====================================================
 * FILE: validateBackup.ts
 * PURPOSE: Reads a backup file's text and checks that it's
 *          safe to import, by hand with small type guards.
 * USED BY: useDataTools.ts
 * =====================================================
 */
import {
  BACKUP_APP_NAME,
  BACKUP_TABLES,
  type Backup,
  type BackupData,
  type BackupRow,
  type BackupTable,
  type ColumnKind,
} from './backupTables';
import { migrateBackup } from './migrateBackup';

export type BackupProblem = 'notJson' | 'wrongApp' | 'newerVersion' | 'tooOld' | 'damaged';

export type BackupCheck =
  | { type: 'valid'; backup: Backup }
  // details says where a damaged file is wrong, such as "athletes, line 3, name".
  | { type: 'invalid'; problem: BackupProblem; details?: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Far longer than any real name or note, so only a damaged file could go past it.
const MAX_TEXT_LENGTH = 5000;

function isGoodText(value: unknown): boolean {
  return typeof value === 'string' && value.length <= MAX_TEXT_LENGTH;
}

// Times, weights, scores and positions are never negative anywhere in the app.
function isGoodNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function matchesKind(value: unknown, kind: ColumnKind): boolean {
  switch (kind) {
    case 'text':
      return isGoodText(value);
    case 'textOrNull':
      return value === null || isGoodText(value);
    case 'number':
      return isGoodNumber(value);
    case 'numberOrNull':
      return value === null || isGoodNumber(value);
  }
}

/**
 * Checks one table's rows, and copies only the columns we know about.
 * @returns the rows, or where the first problem is
 */
function readTable(
  table: BackupTable,
  rows: unknown,
): { rows: BackupRow[] } | { problemAt: string } {
  if (!Array.isArray(rows)) {
    return { problemAt: table.key };
  }

  const clean: BackupRow[] = [];
  const ids = new Set<unknown>();

  for (const [index, row] of rows.entries()) {
    const where = `${table.key}, ${index + 1}`;
    if (!isObject(row)) {
      return { problemAt: where };
    }

    const copy: BackupRow = {};
    for (const [column, kind] of Object.entries(table.columns)) {
      const value = row[column];
      if (!matchesKind(value, kind)) {
        return { problemAt: `${where}, ${column}` };
      }
      copy[column] = value as BackupRow[string];
    }

    // Two rows with one id could never be inserted, so say so before starting.
    if (ids.has(row.id)) {
      return { problemAt: `${where}, id` };
    }
    ids.add(row.id);
    clean.push(copy);
  }

  return { rows: clean };
}

/**
 * Checks a backup file, and brings an older one up to the current version.
 * @param text the file's text
 * @param currentVersion the version of this app's database
 * @returns the backup, or what is wrong with it. It never throws.
 */
export function validateBackup(text: string, currentVersion: number): BackupCheck {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { type: 'invalid', problem: 'notJson' };
  }

  if (!isObject(parsed) || parsed.app !== BACKUP_APP_NAME) {
    return { type: 'invalid', problem: 'wrongApp' };
  }

  const { schemaVersion, exportedAt, scope, data } = parsed;
  if (typeof schemaVersion !== 'number' || !Number.isInteger(schemaVersion)) {
    return { type: 'invalid', problem: 'damaged', details: 'schemaVersion' };
  }
  if (schemaVersion > currentVersion) {
    return { type: 'invalid', problem: 'newerVersion' };
  }

  const migrated = migrateBackup(data, schemaVersion, currentVersion);
  if (migrated === null) {
    return { type: 'invalid', problem: 'tooOld' };
  }
  if (typeof exportedAt !== 'string' || (scope !== 'all' && scope !== 'tournament')) {
    return { type: 'invalid', problem: 'damaged', details: 'exportedAt, scope' };
  }
  if (!isObject(migrated)) {
    return { type: 'invalid', problem: 'damaged', details: 'data' };
  }

  const clean = {} as BackupData;
  for (const table of BACKUP_TABLES) {
    const result = readTable(table, migrated[table.key]);
    if ('problemAt' in result) {
      return { type: 'invalid', problem: 'damaged', details: result.problemAt };
    }
    clean[table.key] = result.rows;
  }

  return {
    type: 'valid',
    backup: {
      app: BACKUP_APP_NAME,
      schemaVersion: currentVersion,
      exportedAt,
      scope,
      data: clean,
    },
  };
}
