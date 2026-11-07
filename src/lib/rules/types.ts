/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the judo rules.
 * USED BY: everything in lib/rules, and the match screen
 *          from step 10
 * =====================================================
 */

export type Side = 'white' | 'blue';

export type Score = 'ippon' | 'wazaAri' | 'yuko';

/** The rules one match is played under. Nothing about judo is hard-coded elsewhere. */
export type RuleSet = {
  isYukoEnabled: boolean;
  hasWazaAriAwaseteIppon: boolean;
  shidosForHansokuMake: number;
  osaekomiSecondsYuko: number | null;
  osaekomiSecondsWazaAri: number;
  osaekomiSecondsIppon: number;
  hasGoldenScore: boolean;
  goldenScoreWonByShido: boolean;
  matchSeconds: number;
  /** null means unlimited. */
  goldenScoreMaxSeconds: number | null;
};

export type SideScore = {
  ippons: number;
  wazaAris: number;
  yukos: number;
  shidos: number;
};

export type ResultType =
  | 'ippon'
  | 'wazaAriAwasete'
  | 'wazaAri'
  | 'yuko'
  | 'hansokuMake'
  | 'kikenGachi'
  | 'fusenGachi'
  | 'decision';

/**
 * How a match stands. A union rather than several booleans, because a match that
 * is both "finished" and "needs a decision" should be impossible to write.
 */
export type MatchOutcome =
  | { type: 'inProgress' }
  // The time ran out and the rules can't decide, so the trainer has to.
  | { type: 'needsDecision' }
  | { type: 'won'; winner: Side; resultType: ResultType }
  // IJF Article 18.3.1: both athletes can lose, recorded as 0-0.
  | { type: 'bothLost' };

export type MatchState = {
  white: SideScore;
  blue: SideScore;
  period: 'regular' | 'goldenScore';
  outcome: MatchOutcome;
};

/** One thing that happened in a match. Saved in order, which is what makes undo possible. */
export type MatchEvent =
  | { type: 'score'; side: Side; score: Score }
  | { type: 'shido'; side: Side }
  // IJF: both athletes can be given a shido at the same moment.
  | { type: 'shidoBoth' }
  | { type: 'shidoRemoved'; side: Side }
  | { type: 'hansokuMake'; side: Side }
  | { type: 'hansokuMakeBoth' }
  // The side here is the athlete who withdrew or didn't turn up, so the other one wins.
  | { type: 'kikenGachi'; withdrawnSide: Side }
  | { type: 'fusenGachi'; absentSide: Side }
  | { type: 'timeUp' }
  | { type: 'decision'; winner: Side };
