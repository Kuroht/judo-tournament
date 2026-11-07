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

// RULE: when a migration changes a table in a backup, add a step here too. The key is
// the version the step upgrades FROM. For example, 5 turns a version 5 backup into 6.
// There are none yet, because version 5 is the first version with backups.
const BACKUP_STEPS: Readonly<Record<number, BackupStep>> = {};

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
