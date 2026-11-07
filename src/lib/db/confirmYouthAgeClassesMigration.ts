/**
 * =====================================================
 * FILE: confirmYouthAgeClassesMigration.ts
 * PURPOSE: Marks the three youngest age classes as checked,
 *          now that their values have been confirmed.
 * USED BY: migrations.ts
 * =====================================================
 */
import type { MigrationDatabase } from './migrationTypes';

/**
 * Removes the "to verify" note from Benjamins, Infantis and Iniciados.
 * Benjamins means 10 or younger, and these classes use a 2-minute match.
 * This is a migration because databases that already exist have the old values.
 */
export async function confirmYouthAgeClasses(db: MigrationDatabase): Promise<void> {
  await db.runAsync(
    `UPDATE age_classes SET isVerified = 1
     WHERE id IN ('fpj-benjamins', 'fpj-infantis', 'fpj-iniciados')`,
  );
}
