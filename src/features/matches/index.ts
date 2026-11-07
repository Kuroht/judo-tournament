/**
 * =====================================================
 * FILE: index.ts
 * PURPOSE: The public API of the matches feature. Other
 *          code imports from here, never from its insides.
 * USED BY: src/app/tournament/[id]/category-matches/*,
 *          the results feature
 * =====================================================
 */
export { CategoryContestsScreen } from './components/CategoryContestsScreen';
export { MatchListScreen } from './components/MatchListScreen';
export { MatchScreen } from './components/MatchScreen';
export { getCategoryContests, listTournamentContests } from './db/contestQueries';
export type { CategoryContests, Contest, ContestAthlete, ContestPlace } from './types';
