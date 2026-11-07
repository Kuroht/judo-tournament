/**
 * =====================================================
 * FILE: tournamentSteps.test.ts
 * PURPOSE: Worked examples of finding a tournament's next step.
 * USED BY: npm test
 * =====================================================
 */
import { getTournamentSteps, type StepKey, type TournamentProgress } from '../tournamentSteps';

const NOTHING: TournamentProgress = {
  categoryCount: 0,
  entryCount: 0,
  weighInDoneCount: 0,
  weighInOpenCount: 0,
  drawableCount: 0,
  lockedDrawCount: 0,
  finishedMatchCount: 0,
  totalMatchCount: 0,
};

// Every athlete weighed, ready for the draw.
const WEIGHED = {
  categoryCount: 8,
  entryCount: 4,
  weighInDoneCount: 4,
  weighInOpenCount: 0,
};

function currentStep(progress: Partial<TournamentProgress>): StepKey | undefined {
  const steps = getTournamentSteps({ ...NOTHING, ...progress });

  return steps.find((step) => step.state === 'current')?.key;
}

describe('getTournamentSteps', () => {
  it('starts with the categories', () => {
    expect(currentStep({})).toBe('categories');
  });

  it('moves on as each step is done', () => {
    expect(currentStep({ categoryCount: 8 })).toBe('registration');
    expect(currentStep({ categoryCount: 8, entryCount: 4, weighInOpenCount: 4 })).toBe('weighIn');
    expect(currentStep({ categoryCount: 8, entryCount: 4, weighInOpenCount: 1 })).toBe('weighIn');
    expect(currentStep({ ...WEIGHED, drawableCount: 1 })).toBe('draw');
  });

  it('waits until every category that needs a draw has a locked one', () => {
    const before = { ...WEIGHED, drawableCount: 2 };

    expect(currentStep({ ...before, lockedDrawCount: 1 })).toBe('draw');
    expect(currentStep({ ...before, lockedDrawCount: 2, totalMatchCount: 6 })).toBe('matches');
  });

  it('stays on the matches until all are finished, then ends on the results', () => {
    const before = { ...WEIGHED, drawableCount: 1, lockedDrawCount: 1, totalMatchCount: 6 };

    expect(currentStep({ ...before, finishedMatchCount: 5 })).toBe('matches');
    expect(currentStep({ ...before, finishedMatchCount: 6 })).toBe('results');
  });

  it('does not get stuck when no category needs a draw', () => {
    // Every category has one athlete, so there is nothing to draw or fight.
    expect(currentStep({ ...WEIGHED, drawableCount: 0 })).toBe('results');
  });

  it('does not send the trainer to weigh athletes whose draw is locked', () => {
    // The weigh-in refuses changes once a draw is locked, so it would lead nowhere.
    const progress = {
      categoryCount: 8,
      entryCount: 4,
      weighInDoneCount: 2,
      weighInOpenCount: 0,
      drawableCount: 1,
      lockedDrawCount: 1,
      totalMatchCount: 6,
    };

    expect(currentStep(progress)).toBe('matches');
  });

  it('goes back to the weigh-in if an athlete in an unlocked category is still to weigh', () => {
    const steps = getTournamentSteps({
      ...NOTHING,
      categoryCount: 8,
      entryCount: 4,
      weighInOpenCount: 2,
      drawableCount: 1,
      lockedDrawCount: 1,
    });

    expect(steps.find((step) => step.key === 'weighIn')?.state).toBe('current');
    expect(steps.find((step) => step.key === 'draw')?.state).toBe('done');
    expect(steps.find((step) => step.key === 'results')?.state).toBe('upcoming');
  });

  it('does not count matches as done before the draws are', () => {
    expect(currentStep({ ...WEIGHED, drawableCount: 2, totalMatchCount: 0 })).toBe('draw');
  });

  it('never has more than one current step', () => {
    const steps = getTournamentSteps({ ...NOTHING, categoryCount: 1 });

    expect(steps.filter((step) => step.state === 'current')).toHaveLength(1);
  });
});
