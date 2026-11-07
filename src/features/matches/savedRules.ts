/**
 * =====================================================
 * FILE: savedRules.ts
 * PURPOSE: Reads the copy of the rules saved on a match.
 * USED BY: matchQueries.ts
 * =====================================================
 */
import type { RuleSet } from '@/lib/rules/types';

/** Checks that a value really is a full set of rules, because it may come from a backup. */
function isRuleSet(value: unknown): value is RuleSet {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const rules = value as Record<string, unknown>;
  const isNumberOrNull = (item: unknown) => item === null || typeof item === 'number';

  return (
    typeof rules.isYukoEnabled === 'boolean' &&
    typeof rules.hasWazaAriAwaseteIppon === 'boolean' &&
    typeof rules.shidosForHansokuMake === 'number' &&
    isNumberOrNull(rules.osaekomiSecondsYuko) &&
    typeof rules.osaekomiSecondsWazaAri === 'number' &&
    typeof rules.osaekomiSecondsIppon === 'number' &&
    typeof rules.hasGoldenScore === 'boolean' &&
    typeof rules.goldenScoreWonByShido === 'boolean' &&
    typeof rules.matchSeconds === 'number' &&
    isNumberOrNull(rules.goldenScoreMaxSeconds)
  );
}

/**
 * Reads a match's saved rules.
 * @param rulesJson the saved text. Matches from before rules were saved have none.
 * @param currentRules the category's rules today, used if the saved copy can't be read
 * @returns the rules this match is fought under
 */
export function readSavedRules(rulesJson: string | null, currentRules: RuleSet): RuleSet {
  if (rulesJson === null) {
    return currentRules;
  }

  try {
    const parsed: unknown = JSON.parse(rulesJson);

    return isRuleSet(parsed) ? parsed : currentRules;
  } catch {
    return currentRules;
  }
}
