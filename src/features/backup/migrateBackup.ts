/**
 * =====================================================
 * FILE: migrateBackup.ts
 * PURPOSE: Brings a backup from an older version of the app
 *          up to the current version.
 * USED BY: validateBackup.ts
 * =====================================================
 */
import { OLDEST_BACKUP_VERSION } from './backupTables';

// Takes a backup's data from one version to the next. The data isn't validated until
// afterward, so a step must not assume anything about its shape.
type BackupStep = (data: unknown) => unknown;

/** Makes a step that gives every match a new, empty column. */
function addEmptyMatchColumn(column: string): BackupStep {
  return (data) => {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const { matches } = data as { matches?: unknown };
    if (!Array.isArray(matches)) {
      return data;
    }

    return {
      ...data,
      matches: matches.map((match: unknown) =>
        typeof match === 'object' && match !== null ? { ...match, [column]: null } : match,
      ),
    };
  };
}

// RULE: when a migration changes a table in a backup, add a step here too. The key is
// the version the step upgrades FROM. For example, 5 turns a version 5 backup into 6.
const BACKUP_STEPS: Readonly<Record<number, BackupStep>> = {
  // Version 6 keeps each match's rules. An older match has none, so it uses today's.
  5: addEmptyMatchColumn('rulesJson'),
  // Version 7 records when each match finished. An older match is simply never "last".
  6: addEmptyMatchColumn('finishedAtMs'),
};

/**
 * Upgrades a backup's data, one version at a time.
 * @param data the backup's data
 * @param fromVersion the version it was exported from
 * @param toVersion the version to bring it up to
 * @param steps the upgrade steps. Only tests pass their own.
 * @returns the upgraded data, or null if a step is missing
 */
export function migrateBackup(
  data: unknown,
  fromVersion: number,
  toVersion: number,
  steps: Readonly<Record<number, BackupStep>> = BACKUP_STEPS,
): unknown {
  if (fromVersion < OLDEST_BACKUP_VERSION) {
    return null;
  }

  let upgraded = data;
  for (let version = fromVersion; version < toVersion; version += 1) {
    const step = steps[version];
    if (step === undefined) {
      return null;
    }
    upgraded = step(upgraded);
  }

  return upgraded;
}
