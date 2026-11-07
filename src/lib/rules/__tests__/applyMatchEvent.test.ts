/**
 * =====================================================
 * FILE: applyMatchEvent.test.ts
 * PURPOSE: Worked examples of how a judo match is decided.
 *          Reading these is a good way to learn the rules.
 * USED BY: npm test
 * =====================================================
 */
import { applyMatchEvent, createMatchState, replayMatchEvents } from '../applyMatchEvent';
import type { MatchEvent, RuleSet, Score, Side } from '../types';

const IJF_RULES: RuleSet = {
  isYukoEnabled: true,
  hasWazaAriAwaseteIppon: true,
  shidosForHansokuMake: 3,
  osaekomiSecondsYuko: 5,
  osaekomiSecondsWazaAri: 10,
  osaekomiSecondsIppon: 20,
  hasGoldenScore: true,
  goldenScoreWonByShido: false,
  matchSeconds: 240,
  goldenScoreMaxSeconds: null,
};

function score(side: Side, value: Score): MatchEvent {
  return { type: 'score', side, score: value };
}

function shido(side: Side): MatchEvent {
  return { type: 'shido', side };
}

const TIME_UP: MatchEvent = { type: 'timeUp' };

function play(events: MatchEvent[], rules: RuleSet = IJF_RULES) {
  return replayMatchEvents(events, rules);
}

describe('scores in regular time', () => {
  it('ends the match on an ippon', () => {
    expect(play([score('white', 'ippon')]).outcome).toEqual({
      type: 'won',
      winner: 'white',
      resultType: 'ippon',
    });
  });

  it('turns two waza-ari into an ippon', () => {
    expect(play([score('blue', 'wazaAri'), score('blue', 'wazaAri')]).outcome).toEqual({
      type: 'won',
      winner: 'blue',
      resultType: 'wazaAriAwasete',
    });
  });

  it('does not end on one waza-ari for each athlete', () => {
    expect(play([score('white', 'wazaAri'), score('blue', 'wazaAri')]).outcome.type).toBe(
      'inProgress',
    );
  });

  it('keeps playing after two waza-ari if the rules turn awasete off', () => {
    const rules = { ...IJF_RULES, hasWazaAriAwaseteIppon: false };

    expect(play([score('white', 'wazaAri'), score('white', 'wazaAri')], rules).outcome.type).toBe(
      'inProgress',
    );
  });

  it('ignores a yuko when the rules turn yuko off', () => {
    const rules = { ...IJF_RULES, isYukoEnabled: false };

    expect(play([score('white', 'yuko')], rules).white.yukos).toBe(0);
  });
});

describe('when the time runs out', () => {
  it('gives the win to the higher waza-ari', () => {
    expect(play([score('white', 'wazaAri'), TIME_UP]).outcome).toEqual({
      type: 'won',
      winner: 'white',
      resultType: 'wazaAri',
    });
  });

  it('gives the win to a waza-ari over several yuko', () => {
    const events = [score('blue', 'wazaAri'), score('white', 'yuko'), score('white', 'yuko'), TIME_UP];

    expect(play(events).outcome).toEqual({ type: 'won', winner: 'blue', resultType: 'wazaAri' });
  });

  it('gives the win to the higher yuko when waza-ari are level', () => {
    const events = [score('blue', 'wazaAri'), score('white', 'wazaAri'), score('white', 'yuko'), TIME_UP];

    expect(play(events).outcome).toEqual({ type: 'won', winner: 'white', resultType: 'yuko' });
  });

  it('goes to golden score when scores are level, however many shidos there are', () => {
    const state = play([shido('white'), shido('white'), TIME_UP]);

    expect(state.period).toBe('goldenScore');
    expect(state.outcome.type).toBe('inProgress');
  });

  it('asks for a decision when level and the age class has no golden score', () => {
    const rules = { ...IJF_RULES, hasGoldenScore: false };

    expect(play([TIME_UP], rules).outcome.type).toBe('needsDecision');
  });
});

describe('golden score', () => {
  it('keeps the scores and shidos from regular time', () => {
    const state = play([score('white', 'yuko'), score('blue', 'yuko'), shido('blue'), TIME_UP]);

    expect(state.white.yukos).toBe(1);
    expect(state.blue.shidos).toBe(1);
  });

  it.each<Score>(['yuko', 'wazaAri', 'ippon'])('ends on a %s', (value) => {
    const state = play([TIME_UP, score('blue', value)]);

    expect(state.outcome.type).toBe('won');
    expect(state.outcome).toMatchObject({ winner: 'blue' });
  });

  it('is not decided by a shido under IJF rules', () => {
    expect(play([TIME_UP, shido('white')]).outcome.type).toBe('inProgress');
  });

  it('can be decided by a shido if local rules allow it', () => {
    const rules = { ...IJF_RULES, goldenScoreWonByShido: true };

    expect(play([TIME_UP, shido('white')], rules).outcome).toEqual({
      type: 'won',
      winner: 'blue',
      resultType: 'decision',
    });
  });

  it('is still won by a third shido', () => {
    expect(play([shido('white'), shido('white'), TIME_UP, shido('white')]).outcome).toEqual({
      type: 'won',
      winner: 'blue',
      resultType: 'hansokuMake',
    });
  });

  it('asks for a decision when a limited golden score runs out', () => {
    const rules = { ...IJF_RULES, goldenScoreMaxSeconds: 60 };

    expect(play([TIME_UP, TIME_UP], rules).outcome.type).toBe('needsDecision');
  });

  it('ignores a stray time-up when golden score is unlimited', () => {
    const state = play([TIME_UP, TIME_UP]);

    expect(state.period).toBe('goldenScore');
    expect(state.outcome.type).toBe('inProgress');
  });

  it('is won by a direct hansoku-make', () => {
    expect(play([TIME_UP, { type: 'hansokuMake', side: 'blue' }]).outcome).toEqual({
      type: 'won',
      winner: 'white',
      resultType: 'hansokuMake',
    });
  });
});

describe('penalties', () => {
  it('gives hansoku-make on the third shido', () => {
    expect(play([shido('blue'), shido('blue'), shido('blue')]).outcome).toEqual({
      type: 'won',
      winner: 'white',
      resultType: 'hansokuMake',
    });
  });

  it('never counts a shido as a score', () => {
    expect(play([shido('blue'), shido('blue')]).white.wazaAris).toBe(0);
    expect(play([shido('blue'), shido('blue')]).outcome.type).toBe('inProgress');
  });

  it('makes both lose when both reach the limit together', () => {
    const both: MatchEvent = { type: 'shidoBoth' };

    expect(play([both, both, both]).outcome).toEqual({ type: 'bothLost' });
  });

  it('makes only one lose when a shido for both takes only one to the limit', () => {
    const both: MatchEvent = { type: 'shidoBoth' };

    expect(play([shido('white'), both, both]).outcome).toMatchObject({
      winner: 'blue',
      resultType: 'hansokuMake',
    });
  });

  it('removes a shido given by mistake, but never below zero', () => {
    const removed: MatchEvent = { type: 'shidoRemoved', side: 'white' };

    expect(play([shido('white'), removed]).white.shidos).toBe(0);
    expect(play([removed]).white.shidos).toBe(0);
  });

  it('handles a direct hansoku-make, for one or both', () => {
    expect(play([{ type: 'hansokuMake', side: 'white' }]).outcome).toMatchObject({ winner: 'blue' });
    expect(play([{ type: 'hansokuMakeBoth' }]).outcome).toEqual({ type: 'bothLost' });
  });
});

describe('matches decided another way', () => {
  it('gives the win to the opponent of a withdrawn or absent athlete', () => {
    expect(play([{ type: 'kikenGachi', withdrawnSide: 'white' }]).outcome).toEqual({
      type: 'won',
      winner: 'blue',
      resultType: 'kikenGachi',
    });
    expect(play([{ type: 'fusenGachi', absentSide: 'blue' }]).outcome).toEqual({
      type: 'won',
      winner: 'white',
      resultType: 'fusenGachi',
    });
  });

  it('lets the trainer enter a decision at any time, or when asked for one', () => {
    const decision: MatchEvent = { type: 'decision', winner: 'blue' };
    const noGolden = { ...IJF_RULES, hasGoldenScore: false };

    expect(play([decision]).outcome).toMatchObject({ winner: 'blue', resultType: 'decision' });
    expect(play([TIME_UP, decision], noGolden).outcome).toMatchObject({ winner: 'blue' });
  });
});

describe('protecting the result', () => {
  it('ignores anything after the match has ended', () => {
    const state = play([score('white', 'ippon'), score('blue', 'ippon'), shido('white'), TIME_UP]);

    expect(state.outcome).toMatchObject({ winner: 'white', resultType: 'ippon' });
    expect(state.blue.ippons).toBe(0);
  });

  it('accepts only a decision while one is needed', () => {
    const rules = { ...IJF_RULES, hasGoldenScore: false };

    expect(play([TIME_UP, score('white', 'ippon')], rules).outcome.type).toBe('needsDecision');
  });

  it('does not change the state it was given', () => {
    const state = createMatchState();
    applyMatchEvent(state, score('white', 'wazaAri'), IJF_RULES);

    expect(state.white.wazaAris).toBe(0);
  });

  it('keeps each side separate when both start from no score', () => {
    expect(play([score('white', 'wazaAri')]).blue.wazaAris).toBe(0);
  });
});

describe('undo', () => {
  it('reopens a finished match by replaying all events but the last', () => {
    const events = [score('white', 'wazaAri'), score('white', 'wazaAri')];

    expect(play(events).outcome.type).toBe('won');

    const undone = play(events.slice(0, -1));
    expect(undone.outcome.type).toBe('inProgress');
    expect(undone.white.wazaAris).toBe(1);
  });

  it('leaves golden score when the time-up is undone', () => {
    const events = [TIME_UP];

    expect(play(events).period).toBe('goldenScore');
    expect(play(events.slice(0, -1)).period).toBe('regular');
  });
});
