/**
 * =====================================================
 * FILE: buildRuleSet.ts
 * PURPOSE: Combines a tournament's rules with an age
 *          class's rules into the rules for one match.
 * USED BY: the match screen from step 10
 * =====================================================
 */
import type { RuleSet } from './types';

/** The rules every age class in a tournament shares. */
export type BaseRules = Pick<
  RuleSet,
  | 'hasWazaAriAwaseteIppon'
  | 'shidosForHansokuMake'
  | 'osaekomiSecondsYuko'
  | 'osaekomiSecondsWazaAri'
  | 'osaekomiSecondsIppon'
  | 'goldenScoreWonByShido'
>;

/** The rules that change with age. */
export type AgeClassRules = Pick<
  RuleSet,
  'isYukoEnabled' | 'hasGoldenScore' | 'matchSeconds' | 'goldenScoreMaxSeconds'
>;

// Used for a category with no age class: FPJ's most common senior values.
export const DEFAULT_AGE_CLASS_RULES: AgeClassRules = {
  isYukoEnabled: true,
  hasGoldenScore: true,
  matchSeconds: 240,
  goldenScoreMaxSeconds: null,
};

/**
 * Builds the rules for one match.
 * @param base the tournament's rule set
 * @param ageClass the age class's rules, or null if the category has no age class
 * @returns the complete rules
 */
export function buildRuleSet(base: BaseRules, ageClass: AgeClassRules | null): RuleSet {
  const ageRules = ageClass ?? DEFAULT_AGE_CLASS_RULES;

  return {
    ...base,
    ...ageRules,
    // Without yuko, a hold can't be worth one, however long it lasts.
    osaekomiSecondsYuko: ageRules.isYukoEnabled ? base.osaekomiSecondsYuko : null,
  };
}
