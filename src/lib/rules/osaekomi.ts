/**
 * =====================================================
 * FILE: osaekomi.ts
 * PURPOSE: Works out what a hold-down is worth.
 * USED BY: the match screen from step 10
 * =====================================================
 */
import type { RuleSet, Score, SideScore } from './types';

export type OsaekomiResult = {
  /** The score the hold has earned so far, or null if it's still too short. */
  score: Score | null;
  /** True when the hold has earned everything it can, so it should stop now. */
  isFinished: boolean;
};

/**
 * Works out what a hold is worth after a number of seconds.
 * IJF Article 7: yuko from 5 seconds, waza-ari from 10, ippon at 20.
 * One hold earns one score, so only save a score event once the hold has ended. Saving
 * a yuko at 5 seconds and a waza-ari at 10 would wrongly count both for the same hold.
 * @param seconds how long the hold has lasted
 * @param tori the score of the athlete holding, whose waza-ari matters below
 * @param isGoldenScore true during golden score, where any score ends the match
 * @param rules the match's rules
 * @returns the score earned, and whether the hold is finished
 * @example
 * osaekomiResult(12, noScore, false, rules); // { score: 'wazaAri', isFinished: false }
 * osaekomiResult(5, noScore, true, rules);   // { score: 'yuko', isFinished: true }
 */
export function osaekomiResult(
  seconds: number,
  tori: SideScore,
  isGoldenScore: boolean,
  rules: RuleSet,
): OsaekomiResult {
  if (seconds >= rules.osaekomiSecondsIppon) {
    return { score: 'ippon', isFinished: true };
  }

  if (seconds >= rules.osaekomiSecondsWazaAri) {
    // A second waza-ari is an ippon, so holding any longer would change nothing.
    const isSecondWazaAri = rules.hasWazaAriAwaseteIppon && tori.wazaAris >= 1;

    return { score: 'wazaAri', isFinished: isGoldenScore || isSecondWazaAri };
  }

  const yukoSeconds = rules.isYukoEnabled ? rules.osaekomiSecondsYuko : null;
  if (yukoSeconds !== null && seconds >= yukoSeconds) {
    return { score: 'yuko', isFinished: isGoldenScore };
  }

  return { score: null, isFinished: false };
}
