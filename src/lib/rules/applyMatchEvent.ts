/**
 * =====================================================
 * FILE: applyMatchEvent.ts
 * PURPOSE: The rules of a judo match. Takes the match as it
 *          stands plus one event, and returns the new match.
 * USED BY: the match screen from step 10
 * =====================================================
 */
import type {
  MatchEvent,
  MatchOutcome,
  MatchState,
  ResultType,
  RuleSet,
  Score,
  Side,
  SideScore,
} from './types';

const NO_SCORE: SideScore = { ippons: 0, wazaAris: 0, yukos: 0, shidos: 0 };

// ---------------------------------------------
// SECTION: Helpers
// ---------------------------------------------

function otherSide(side: Side): Side {
  return side === 'white' ? 'blue' : 'white';
}

function won(winner: Side, resultType: ResultType): MatchOutcome {
  return { type: 'won', winner, resultType };
}

/**
 * Finds who leads on technical scores. Shidos are left out on purpose, because
 * IJF says a penalty is never a score. A waza-ari beats any number of yuko.
 */
function findLeader(state: MatchState): { side: Side; resultType: ResultType } | null {
  const { white, blue } = state;

  if (white.wazaAris !== blue.wazaAris) {
    return { side: white.wazaAris > blue.wazaAris ? 'white' : 'blue', resultType: 'wazaAri' };
  }
  if (white.yukos !== blue.yukos) {
    return { side: white.yukos > blue.yukos ? 'white' : 'blue', resultType: 'yuko' };
  }

  return null;
}

// ---------------------------------------------
// SECTION: One function per kind of event
// ---------------------------------------------

function applyScore(state: MatchState, side: Side, score: Score, rules: RuleSet): MatchState {
  if (score === 'yuko' && !rules.isYukoEnabled) {
    return state;
  }

  const current = state[side];
  const updated: SideScore = {
    ...current,
    ippons: current.ippons + (score === 'ippon' ? 1 : 0),
    wazaAris: current.wazaAris + (score === 'wazaAri' ? 1 : 0),
    yukos: current.yukos + (score === 'yuko' ? 1 : 0),
  };
  const next = { ...state, [side]: updated };

  if (score === 'ippon') {
    return { ...next, outcome: won(side, 'ippon') };
  }
  if (score === 'wazaAri' && rules.hasWazaAriAwaseteIppon && updated.wazaAris >= 2) {
    return { ...next, outcome: won(side, 'wazaAriAwasete') };
  }
  // In golden score, the first score wins.
  if (state.period === 'goldenScore') {
    return { ...next, outcome: won(side, score) };
  }

  return next;
}

function applyShido(state: MatchState, side: Side, rules: RuleSet): MatchState {
  const updated = { ...state[side], shidos: state[side].shidos + 1 };
  const next = { ...state, [side]: updated };

  if (updated.shidos >= rules.shidosForHansokuMake) {
    return { ...next, outcome: won(otherSide(side), 'hansokuMake') };
  }

  // Only for local rules that allow it. IJF rules leave this switched off.
  const isBehindOnShidos = updated.shidos > state[otherSide(side)].shidos;
  if (state.period === 'goldenScore' && rules.goldenScoreWonByShido && isBehindOnShidos) {
    return { ...next, outcome: won(otherSide(side), 'decision') };
  }

  return next;
}

function applyShidoBoth(state: MatchState, rules: RuleSet): MatchState {
  const white = { ...state.white, shidos: state.white.shidos + 1 };
  const blue = { ...state.blue, shidos: state.blue.shidos + 1 };
  const next = { ...state, white, blue };
  const isWhiteOut = white.shidos >= rules.shidosForHansokuMake;
  const isBlueOut = blue.shidos >= rules.shidosForHansokuMake;

  if (isWhiteOut && isBlueOut) {
    return { ...next, outcome: { type: 'bothLost' } };
  }
  if (isWhiteOut) {
    return { ...next, outcome: won('blue', 'hansokuMake') };
  }
  if (isBlueOut) {
    return { ...next, outcome: won('white', 'hansokuMake') };
  }

  return next;
}

function applyTimeUp(state: MatchState, rules: RuleSet): MatchState {
  if (state.period === 'goldenScore') {
    // Unlimited golden score can't run out, so a stray time-up must change nothing.
    if (rules.goldenScoreMaxSeconds === null) {
      return state;
    }

    // When a limit runs out, the referee has to decide (FPJ Articles 14.2, 15.2).
    return { ...state, outcome: { type: 'needsDecision' } };
  }

  const leader = findLeader(state);
  if (leader !== null) {
    return { ...state, outcome: won(leader.side, leader.resultType) };
  }

  // Scores are level, whatever the shidos are, so they play on (IJF Article 13.3b).
  return rules.hasGoldenScore
    ? { ...state, period: 'goldenScore' }
    : { ...state, outcome: { type: 'needsDecision' } };
}

// ---------------------------------------------
// SECTION: Public functions
// ---------------------------------------------

/** The state of a match before anything has happened. */
export function createMatchState(period: MatchState['period'] = 'regular'): MatchState {
  return {
    white: NO_SCORE,
    blue: NO_SCORE,
    period,
    outcome: { type: 'inProgress' },
  };
}

/**
 * Applies one event to a match. It never changes the state it receives.
 * @param state the match as it stands
 * @param event what just happened
 * @param rules the match's rules
 * @returns the new state. A finished match stays as it is, so a stray tap after
 *          the end can't change the result. Only a decision can follow "needsDecision".
 * @example
 * const next = applyMatchEvent(state, { type: 'score', side: 'white', score: 'ippon' }, rules);
 * next.outcome; // { type: 'won', winner: 'white', resultType: 'ippon' }
 */
export function applyMatchEvent(state: MatchState, event: MatchEvent, rules: RuleSet): MatchState {
  if (state.outcome.type === 'needsDecision') {
    return event.type === 'decision'
      ? { ...state, outcome: won(event.winner, 'decision') }
      : state;
  }
  if (state.outcome.type !== 'inProgress') {
    return state;
  }

  switch (event.type) {
    case 'score':
      return applyScore(state, event.side, event.score, rules);
    case 'shido':
      return applyShido(state, event.side, rules);
    case 'shidoBoth':
      return applyShidoBoth(state, rules);
    case 'shidoRemoved': {
      const shidos = Math.max(0, state[event.side].shidos - 1);
      return { ...state, [event.side]: { ...state[event.side], shidos } };
    }
    case 'hansokuMake':
      return { ...state, outcome: won(otherSide(event.side), 'hansokuMake') };
    case 'hansokuMakeBoth':
      return { ...state, outcome: { type: 'bothLost' } };
    case 'kikenGachi':
      return { ...state, outcome: won(otherSide(event.withdrawnSide), 'kikenGachi') };
    case 'fusenGachi':
      return { ...state, outcome: won(otherSide(event.absentSide), 'fusenGachi') };
    case 'timeUp':
      return applyTimeUp(state, rules);
    case 'decision':
      // The trainer can always override the rules and enter a result by hand.
      return { ...state, outcome: won(event.winner, 'decision') };
  }
}

/**
 * Rebuilds a match from its saved events. Undo is simply replaying every event
 * except the last, so that an undo can never leave the scores in a wrong state.
 * @param events the match's events, in order
 * @param rules the match's rules
 * @param startPeriod where the match starts. A tie's new contest starts in golden score.
 * @returns the state after all of them
 */
export function replayMatchEvents(
  events: readonly MatchEvent[],
  rules: RuleSet,
  startPeriod: MatchState['period'] = 'regular',
): MatchState {
  return events.reduce(
    (state, event) => applyMatchEvent(state, event, rules),
    createMatchState(startPeriod),
  );
}
