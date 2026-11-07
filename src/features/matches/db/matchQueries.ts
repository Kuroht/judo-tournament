/**
 * =====================================================
 * FILE: matchQueries.ts
 * PURPOSE: Reads one match, and saves everything that
 *          happens in it. Every tap is saved straight away,
 *          so closing the app can't lose a match.
 * USED BY: useMatchData.ts, useLiveMatch.ts
 * =====================================================
 */
import type { SQLiteDatabase } from 'expo-sqlite';

import { createId } from '@/lib/db/createId';
import { buildRuleSet, type AgeClassRules, type BaseRules } from '@/lib/rules/buildRuleSet';
import type { MatchClock } from '@/lib/rules/matchClock';
import type { MatchEvent, ResultType, RuleSet, Side, SideScore } from '@/lib/rules/types';

import { countDependentMatches } from '../buildCategoryContests';
import { fromEventRow, toEventRow, type MatchEventRow } from '../matchEventRows';
import type { Contest, MatchData, MatchRow, SavedEvent } from '../types';
import { getCategoryContests } from './contestQueries';

type RulesRow = Omit<BaseRules, 'hasWazaAriAwaseteIppon' | 'goldenScoreWonByShido'> & {
  hasWazaAriAwaseteIppon: number;
  goldenScoreWonByShido: number;
  ageClassId: string | null;
  isYukoEnabled: number;
  hasGoldenScore: number;
  matchSeconds: number;
  goldenScoreMaxSeconds: number | null;
};

/** Reads the rules a category's matches are played under. */
async function getCategoryRules(db: SQLiteDatabase, categoryId: string): Promise<RuleSet | null> {
  const row = await db.getFirstAsync<RulesRow>(
    `SELECT rule_sets.hasWazaAriAwaseteIppon, rule_sets.shidosForHansokuMake,
       rule_sets.osaekomiSecondsYuko, rule_sets.osaekomiSecondsWazaAri,
       rule_sets.osaekomiSecondsIppon, rule_sets.goldenScoreWonByShido,
       categories.ageClassId, age_classes.isYukoEnabled, age_classes.hasGoldenScore,
       age_classes.matchSeconds, age_classes.goldenScoreMaxSeconds
     FROM categories
     JOIN tournaments ON tournaments.id = categories.tournamentId
     JOIN rule_sets ON rule_sets.id = tournaments.ruleSetId
     LEFT JOIN age_classes ON age_classes.id = categories.ageClassId
     WHERE categories.id = ?`,
    [categoryId],
  );

  if (row === null) {
    return null;
  }

  const ageClass: AgeClassRules | null =
    row.ageClassId === null
      ? null
      : {
          isYukoEnabled: row.isYukoEnabled === 1,
          hasGoldenScore: row.hasGoldenScore === 1,
          matchSeconds: row.matchSeconds,
          goldenScoreMaxSeconds: row.goldenScoreMaxSeconds,
        };

  return buildRuleSet(
    {
      hasWazaAriAwaseteIppon: row.hasWazaAriAwaseteIppon === 1,
      shidosForHansokuMake: row.shidosForHansokuMake,
      osaekomiSecondsYuko: row.osaekomiSecondsYuko,
      osaekomiSecondsWazaAri: row.osaekomiSecondsWazaAri,
      osaekomiSecondsIppon: row.osaekomiSecondsIppon,
      goldenScoreWonByShido: row.goldenScoreWonByShido === 1,
    },
    ageClass,
  );
}

const SELECT_MATCH = `SELECT id, matchKey, whiteEntryId, blueEntryId, status, resultType,
  winnerEntryId, clockElapsedSeconds, clockStartedAtMs, osaekomiSide, osaekomiStartedAtMs
  FROM matches WHERE categoryId = ? AND matchKey = ?`;

/**
 * Finds a contest's saved match, or creates it the first time it's opened. A saved
 * match between other athletes is left over from an earlier draw. It's set aside by
 * clearing its key, rather than deleted, so that a result is never destroyed.
 */
async function getOrCreateMatchRow(
  db: SQLiteDatabase,
  categoryId: string,
  contest: Contest,
  whiteEntryId: string,
  blueEntryId: string,
  rules: RuleSet,
): Promise<MatchRow | null> {
  const existing = await db.getFirstAsync<MatchRow>(SELECT_MATCH, [categoryId, contest.key]);
  const isSamePair =
    existing?.whiteEntryId === whiteEntryId && existing?.blueEntryId === blueEntryId;

  if (existing !== null && isSamePair) {
    return existing;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync('UPDATE matches SET matchKey = NULL WHERE categoryId = ? AND matchKey = ?', [
      categoryId,
      contest.key,
    ]);
    // round and slot are required by the first table design. matchKey now identifies
    // the contest, so they aren't used.
    await db.runAsync(
      `INSERT INTO matches (id, categoryId, round, slot, bracketPart, matchKey, whiteEntryId,
         blueEntryId, clockElapsedSeconds)
       VALUES (?, ?, 0, 0, ?, ?, ?, ?, ?)`,
      [
        createId(),
        categoryId,
        contest.part,
        contest.key,
        whiteEntryId,
        blueEntryId,
        // A tie's new contest is all golden score, whose clock starts after regular time.
        contest.isPlayoff ? rules.matchSeconds : 0,
      ],
    );
  });

  return db.getFirstAsync<MatchRow>(SELECT_MATCH, [categoryId, contest.key]);
}

/**
 * Reads everything the match screen needs.
 * @returns the match, or null if this contest can't be fought yet
 */
export async function getMatchData(
  db: SQLiteDatabase,
  categoryId: string,
  matchKey: string,
): Promise<MatchData | null> {
  const category = await getCategoryContests(db, categoryId);
  const contest = category?.contests.find((other) => other.key === matchKey);
  const rules = await getCategoryRules(db, categoryId);

  if (!contest || contest.white === null || contest.blue === null || rules === null) {
    return null;
  }

  const row = await getOrCreateMatchRow(
    db,
    categoryId,
    contest,
    contest.white.entryId,
    contest.blue.entryId,
    rules,
  );
  if (category === null || row === null) {
    return null;
  }

  const eventRows = await db.getAllAsync<MatchEventRow & { clockSeconds: number }>(
    'SELECT type, side, clockSeconds FROM match_events WHERE matchId = ? ORDER BY sequence',
    [row.id],
  );
  const events: SavedEvent[] = [];
  for (const eventRow of eventRows) {
    const event = fromEventRow(eventRow);
    if (event !== null) {
      events.push({ event, clockSeconds: eventRow.clockSeconds });
    }
  }

  return {
    row,
    contest,
    white: contest.white,
    blue: contest.blue,
    rules,
    events,
    dependentCount: countDependentMatches(
      category.format,
      category.athletes,
      category.finished,
      matchKey,
    ),
  };
}

/**
 * Reopens a finished match to correct it. Its events stay, so the trainer can undo or
 * change them. Later results aren't touched: they still count if the same athletes end
 * up meeting. Otherwise those contests have to be fought again, and opening one sets the
 * old result aside for good, even if a later correction brings the same athletes back.
 */
export async function reopenMatch(db: SQLiteDatabase, matchId: string): Promise<void> {
  await db.runAsync(
    `UPDATE matches SET status = 'running', winnerEntryId = NULL, resultType = NULL,
       durationSeconds = NULL
     WHERE id = ?`,
    [matchId],
  );
}

/**
 * Saves one event together with where the clock now stands.
 * @param clock the clock after the event
 * @param clockSeconds the seconds on the clock when it happened
 * @param shouldEndHold true if the event also ends the running hold
 */
export async function saveMatchEvent(
  db: SQLiteDatabase,
  matchId: string,
  event: MatchEvent,
  clock: MatchClock,
  clockSeconds: number,
  shouldEndHold: boolean,
): Promise<void> {
  const { type, side } = toEventRow(event);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO match_events (id, matchId, sequence, type, side, clockSeconds)
       VALUES (?, ?, (SELECT COALESCE(MAX(sequence), 0) + 1 FROM match_events WHERE matchId = ?), ?, ?, ?)`,
      [createId(), matchId, matchId, type, side, clockSeconds],
    );
    await db.runAsync(
      `UPDATE matches SET status = 'running', clockElapsedSeconds = ?, clockStartedAtMs = ?
       WHERE id = ?`,
      [clock.elapsedSeconds, clock.startedAtMs, matchId],
    );
    if (shouldEndHold) {
      await saveHold(db, matchId, null, null);
    }
  });
}

/**
 * Removes a match's last event. Replaying the rest then gives the correct scores.
 * A time-up also moved the clock to the end of the period, so undoing one puts the
 * time back. Otherwise, the next start would call time-up again at once.
 */
export async function removeLastEvent(db: SQLiteDatabase, matchId: string): Promise<void> {
  const last = await db.getFirstAsync<{ id: string; type: string; clockSeconds: number }>(
    `SELECT id, type, clockSeconds FROM match_events
     WHERE matchId = ? ORDER BY sequence DESC LIMIT 1`,
    [matchId],
  );
  if (last === null) {
    return;
  }

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM match_events WHERE id = ?', [last.id]);
    if (last.type === 'timeUp') {
      await db.runAsync(
        'UPDATE matches SET clockElapsedSeconds = ?, clockStartedAtMs = NULL WHERE id = ?',
        [last.clockSeconds, matchId],
      );
    }
  });
}

/** Saves the match clock. */
export async function saveClock(
  db: SQLiteDatabase,
  matchId: string,
  clock: MatchClock,
): Promise<void> {
  await db.runAsync(
    `UPDATE matches SET status = 'running', clockElapsedSeconds = ?, clockStartedAtMs = ?
     WHERE id = ?`,
    [clock.elapsedSeconds, clock.startedAtMs, matchId],
  );
}

/** Starts a hold, or ends it when both values are null. */
export async function saveHold(
  db: SQLiteDatabase,
  matchId: string,
  side: Side | null,
  startedAtMs: number | null,
): Promise<void> {
  await db.runAsync(
    `UPDATE matches SET status = 'running', osaekomiSide = ?, osaekomiStartedAtMs = ?
     WHERE id = ?`,
    [side, startedAtMs, matchId],
  );
}

export type MatchResult = {
  winnerEntryId: string | null;
  resultType: ResultType;
  isGoldenScore: boolean;
  white: SideScore;
  blue: SideScore;
  durationSeconds: number;
};

/** Saves a match's final result. */
export async function finishMatch(
  db: SQLiteDatabase,
  matchId: string,
  result: MatchResult,
): Promise<void> {
  const { white, blue } = result;

  await db.runAsync(
    `UPDATE matches SET status = 'finished', winnerEntryId = ?, resultType = ?, isGoldenScore = ?,
       whiteIppons = ?, whiteWazaAris = ?, whiteYukos = ?, whiteShidos = ?,
       blueIppons = ?, blueWazaAris = ?, blueYukos = ?, blueShidos = ?,
       durationSeconds = ?, clockStartedAtMs = NULL, osaekomiSide = NULL, osaekomiStartedAtMs = NULL
     WHERE id = ?`,
    [
      result.winnerEntryId,
      result.resultType,
      result.isGoldenScore ? 1 : 0,
      white.ippons,
      white.wazaAris,
      white.yukos,
      white.shidos,
      blue.ippons,
      blue.wazaAris,
      blue.yukos,
      blue.shidos,
      result.durationSeconds,
      matchId,
    ],
  );
}
