/**
 * =====================================================
 * FILE: rulePresetQueries.ts
 * PURPOSE: Reads and saves each age class's rules.
 * USED BY: useRulePresets.ts, useRulePresetForm.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import type { RulePreset, RulePresetRules } from '../types';

type RulePresetRow = Omit<RulePreset, 'hasGoldenScore' | 'isYukoEnabled'> & {
  hasGoldenScore: number;
  isYukoEnabled: number;
};

const SELECT_PRESETS = `SELECT id, name, matchSeconds, hasGoldenScore, goldenScoreMaxSeconds,
  isYukoEnabled, weightToleranceGrams FROM age_classes`;

function fromRow(row: RulePresetRow): RulePreset {
  return {
    ...row,
    hasGoldenScore: row.hasGoldenScore === 1,
    isYukoEnabled: row.isYukoEnabled === 1,
  };
}

/** Lists the age classes, youngest first. */
export async function listRulePresets(db: SQLiteDatabase): Promise<RulePreset[]> {
  const rows = await db.getAllAsync<RulePresetRow>(`${SELECT_PRESETS} ORDER BY sortOrder`);

  return rows.map(fromRow);
}

/** Reads one age class. @returns its rules, or null if it no longer exists */
export async function getRulePreset(db: SQLiteDatabase, id: string): Promise<RulePreset | null> {
  const row = await db.getFirstAsync<RulePresetRow>(`${SELECT_PRESETS} WHERE id = ?`, [id]);

  return row === null ? null : fromRow(row);
}

/** Saves one age class's rules. */
export async function updateRulePreset(
  db: SQLiteDatabase,
  id: string,
  rules: RulePresetRules,
): Promise<void> {
  await db.runAsync(
    `UPDATE age_classes SET matchSeconds = ?, hasGoldenScore = ?, goldenScoreMaxSeconds = ?,
       isYukoEnabled = ?, weightToleranceGrams = ?
     WHERE id = ?`,
    [
      rules.matchSeconds,
      rules.hasGoldenScore ? 1 : 0,
      rules.goldenScoreMaxSeconds,
      rules.isYukoEnabled ? 1 : 0,
      rules.weightToleranceGrams,
      id,
    ],
  );
}
