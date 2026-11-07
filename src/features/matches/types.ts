/**
 * =====================================================
 * FILE: types.ts
 * PURPOSE: Types for the matches feature.
 * USED BY: the matches feature
 * =====================================================
 */
import type { CategoryFormat } from '@/features/categories';
import type { BracketPart } from '@/lib/brackets/resolveBracket';
import type { MatchEvent, ResultType, RuleSet, Side } from '@/lib/rules/types';

/** An athlete taking part in a category's matches. */
export type ContestAthlete = {
  entryId: string;
  name: string;
  clubId: string | null;
  clubName: string | null;
  position: number;
  weighedKg: number | null;
};

/** A saved, finished match, used to work out the rest of the bracket. */
export type FinishedMatch = {
  matchKey: string;
  whiteEntryId: string;
  blueEntryId: string;
  // Null when both athletes lost.
  winnerEntryId: string | null;
  resultType: ResultType | null;
  durationSeconds: number;
};

/** One contest in a category. A null athlete isn't known yet. */
export type Contest = {
  key: string;
  part: BracketPart | 'poule';
  pouleName: 'A' | 'B' | null;
  // True for a new contest after a tie, which is fought in golden score from the start.
  isPlayoff: boolean;
  white: ContestAthlete | null;
  blue: ContestAthlete | null;
  isFinished: boolean;
  winnerEntryId: string | null;
  resultType: ResultType | null;
};

/** Where one athlete finished, by draw position. Places can be shared. */
export type ContestPlace = {
  position: number;
  place: number;
};

export type CategoryContests = {
  categoryId: string;
  title: string;
  format: CategoryFormat;
  // False until the draw is locked and still matches its athletes.
  isReady: boolean;
  runningKeys: string[];
  athletes: ContestAthlete[];
  finished: FinishedMatch[];
  contests: Contest[];
  // Only final once every contest has finished.
  places: ContestPlace[];
};

/** A match's saved row. */
export type MatchRow = {
  id: string;
  matchKey: string;
  whiteEntryId: string;
  blueEntryId: string;
  status: 'pending' | 'running' | 'finished';
  resultType: ResultType | null;
  winnerEntryId: string | null;
  clockElapsedSeconds: number;
  clockStartedAtMs: number | null;
  osaekomiSide: Side | null;
  osaekomiStartedAtMs: number | null;
};

/** One saved event, with the time on the clock when it happened. */
export type SavedEvent = {
  event: MatchEvent;
  clockSeconds: number;
};

/** Everything the match screen needs. */
export type MatchData = {
  row: MatchRow;
  contest: Contest;
  white: ContestAthlete;
  blue: ContestAthlete;
  rules: RuleSet;
  events: SavedEvent[];
  // How many other finished matches depend on this one's result.
  dependentCount: number;
};
