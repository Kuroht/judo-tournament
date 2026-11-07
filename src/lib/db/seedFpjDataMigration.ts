/**
 * =====================================================
 * FILE: seedFpjDataMigration.ts
 * PURPOSE: Copies the FPJ starting data into the database.
 * USED BY: migrations.ts
 * =====================================================
 */
import { DEFAULT_RULE_SET, FPJ_AGE_CLASSES, type FpjAgeClass } from '@/lib/constants/fpjCategories';

import type { MigrationDatabase } from './migrationTypes';

// ---------------------------------------------
// SECTION: Helpers
// ---------------------------------------------

/**
 * Inserts one sex's weight categories for an age class.
 * @param weightsKg upper limits in kg, such as [60, 66], which creates
 *                  -60 kg, -66 kg and +66 kg
 */
async function insertWeights(
  db: MigrationDatabase,
  ageClass: FpjAgeClass,
  sex: 'male' | 'female',
  weightsKg: readonly number[],
): Promise<void> {
  const sql = `INSERT INTO weight_templates (id, ageClassId, sex, label, minKg, maxKg, sortOrder)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;

  for (const [index, maxKg] of weightsKg.entries()) {
    const id = `${ageClass.id}-${sex}-${maxKg}`;
    const minKg = index === 0 ? null : (weightsKg[index - 1] ?? null);
    await db.runAsync(sql, [id, ageClass.id, sex, `-${maxKg} kg`, minKg, maxKg, index]);
  }

  // 1. The heaviest category has no upper limit, so it needs its own row.
  const heaviestKg = weightsKg.at(-1);
  if (heaviestKg !== undefined) {
    const id = `${ageClass.id}-${sex}-over-${heaviestKg}`;
    const label = `+${heaviestKg} kg`;
    await db.runAsync(sql, [id, ageClass.id, sex, label, heaviestKg, null, weightsKg.length]);
  }
}

// ---------------------------------------------
// SECTION: Migration
// ---------------------------------------------

/**
 * Fills the rule set, age class and weight tables. It runs once per database,
 * so anything the trainer later edits or deletes never comes back.
 */
export async function seedFpjData(db: MigrationDatabase): Promise<void> {
  const rules = DEFAULT_RULE_SET;
  await db.runAsync(
    `INSERT INTO rule_sets (id, name, hasWazaAriAwaseteIppon, shidosForHansokuMake,
       osaekomiSecondsYuko, osaekomiSecondsWazaAri, osaekomiSecondsIppon, goldenScoreWonByShido)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      rules.id,
      rules.name,
      rules.hasWazaAriAwaseteIppon ? 1 : 0,
      rules.shidosForHansokuMake,
      rules.osaekomiSecondsYuko,
      rules.osaekomiSecondsWazaAri,
      rules.osaekomiSecondsIppon,
      rules.goldenScoreWonByShido ? 1 : 0,
    ],
  );

  for (const [index, ageClass] of FPJ_AGE_CLASSES.entries()) {
    const hasWeights = ageClass.maleWeightsKg.length > 0;
    await db.runAsync(
      `INSERT INTO age_classes (id, name, minAge, maxAge, matchSeconds, hasGoldenScore,
         goldenScoreMaxSeconds, isYukoEnabled, weightToleranceGrams, hasWeightCategories,
         isVerified, sortOrder)
       VALUES (?, ?, ?, ?, ?, 1, ?, 1, ?, ?, ?, ?)`,
      [
        ageClass.id,
        ageClass.name,
        ageClass.minAge,
        ageClass.maxAge,
        ageClass.matchSeconds,
        ageClass.goldenScoreMaxSeconds,
        ageClass.weightToleranceGrams,
        hasWeights ? 1 : 0,
        ageClass.isVerified ? 1 : 0,
        index,
      ],
    );

    await insertWeights(db, ageClass, 'male', ageClass.maleWeightsKg);
    await insertWeights(db, ageClass, 'female', ageClass.femaleWeightsKg);
  }
}
