/**
 * =====================================================
 * FILE: runMigrations.ts
 * PURPOSE: Brings a database up to the latest version by
 *          running only the migrations it hasn't had yet.
 * USED BY: initDatabase.ts
 * =====================================================
 */
import type { Migration, MigrationDatabase } from './migrationTypes';

/**
 * Runs every migration newer than the database's current version.
 * Each one runs in its own transaction, so a failure undoes that migration
 * completely and leaves the data from earlier ones safe.
 * @param db the open database
 * @param migrations the full list of migrations, in any order
 * @returns the version the database is now on
 * @throws if a migration fails, or if the database comes from a newer app version
 */
export async function runMigrations(
  db: MigrationDatabase,
  migrations: readonly Migration[],
): Promise<number> {
  await db.execAsync(`CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    appliedAtMs INTEGER NOT NULL
  )`);

  const row = await db.getFirstAsync<{ version: number | null }>(
    'SELECT MAX(version) AS version FROM schema_version',
  );
  let currentVersion = row?.version ?? 0;

  const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version);
  const latestVersion = sortedMigrations.at(-1)?.version ?? 0;

  // An imported or older install could be ahead of this code. Refuse rather than
  // risk damaging data this version of the app doesn't understand.
  if (currentVersion > latestVersion) {
    throw new Error(
      `Database version ${currentVersion} is newer than this app supports (${latestVersion}).`,
    );
  }

  for (const migration of sortedMigrations) {
    if (migration.version <= currentVersion) {
      continue;
    }

    await db.withTransactionAsync(async () => {
      await migration.run(db);
      await db.runAsync('INSERT INTO schema_version (version, appliedAtMs) VALUES (?, ?)', [
        migration.version,
        Date.now(),
      ]);
    });
    currentVersion = migration.version;
  }

  return currentVersion;
}
