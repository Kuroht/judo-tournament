/**
 * =====================================================
 * FILE: tournamentSteps.ts
 * PURPOSE: Works out where a tournament has got to, so that
 *          the app can say what to do next. A pure function,
 *          so it's easy to test. It only guides: every step
 *          can still be opened at any time.
 * USED BY: TournamentOverviewScreen.tsx
 * =====================================================
 */

export type StepKey = 'categories' | 'registration' | 'weighIn' | 'draw' | 'matches' | 'results';

export type StepState = 'done' | 'current' | 'upcoming';

export type TournamentStep = {
  key: StepKey;
  state: StepState;
};

/** The numbers that show how far a tournament has got. */
export type TournamentProgress = {
  categoryCount: number;
  entryCount: number;
  weighInDoneCount: number;
  // Athletes still to weigh whose draw isn't locked. A locked draw refuses any weigh-in
  // change, so sending the trainer there would lead nowhere.
  weighInOpenCount: number;
  // Categories with enough athletes to need a draw.
  drawableCount: number;
  lockedDrawCount: number;
  finishedMatchCount: number;
  totalMatchCount: number;
};

const STEP_ORDER: readonly StepKey[] = [
  'categories',
  'registration',
  'weighIn',
  'draw',
  'matches',
  'results',
];

function isStepDone(key: StepKey, progress: TournamentProgress): boolean {
  switch (key) {
    case 'categories':
      return progress.categoryCount > 0;
    case 'registration':
      return progress.entryCount > 0;
    case 'weighIn':
      return progress.entryCount > 0 && progress.weighInOpenCount === 0;
    case 'draw':
      // With no category needing a draw, such as one athlete in each, there's nothing to do.
      return progress.entryCount > 0 && progress.lockedDrawCount >= progress.drawableCount;
    case 'matches':
      return (
        isStepDone('draw', progress) && progress.finishedMatchCount >= progress.totalMatchCount
      );
    case 'results':
      // Results have nothing to complete: they're where a tournament ends up.
      return false;
  }
}

/**
 * Works out each step's state. The first step not done is the current one, even if a
 * later one is done, because the trainer may have gone out of order.
 * @param progress the tournament's numbers
 * @returns the steps, in order
 */
export function getTournamentSteps(progress: TournamentProgress): TournamentStep[] {
  const currentKey = STEP_ORDER.find((key) => !isStepDone(key, progress));

  return STEP_ORDER.map((key) => {
    if (key === currentKey) {
      return { key, state: 'current' };
    }

    return { key, state: isStepDone(key, progress) ? 'done' : 'upcoming' };
  });
}
