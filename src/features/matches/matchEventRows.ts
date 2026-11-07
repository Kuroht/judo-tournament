/**
 * =====================================================
 * FILE: matchEventRows.ts
 * PURPOSE: Converts match events to and from the two
 *          columns that store them (type and side).
 * USED BY: matchQueries.ts
 * =====================================================
 */
import type { MatchEvent, Side } from '@/lib/rules/types';

export type MatchEventRow = {
  type: string;
  side: Side | null;
};

/**
 * Turns an event into its saved form. A score is saved by the kind of score, and
 * every event's athlete goes in the side column, whatever that athlete's role is.
 * @example
 * toEventRow({ type: 'score', side: 'white', score: 'ippon' }); // { type: 'ippon', side: 'white' }
 */
export function toEventRow(event: MatchEvent): MatchEventRow {
  switch (event.type) {
    case 'score':
      return { type: event.score, side: event.side };
    case 'shido':
    case 'shidoRemoved':
    case 'hansokuMake':
      return { type: event.type, side: event.side };
    case 'kikenGachi':
      return { type: event.type, side: event.withdrawnSide };
    case 'fusenGachi':
      return { type: event.type, side: event.absentSide };
    case 'decision':
      return { type: event.type, side: event.winner };
    case 'shidoBoth':
    case 'hansokuMakeBoth':
    case 'timeUp':
      return { type: event.type, side: null };
  }
}

/**
 * Turns a saved row back into an event.
 * @returns the event, or null if the row isn't one this version of the app understands
 */
export function fromEventRow(row: MatchEventRow): MatchEvent | null {
  const { type, side } = row;

  if (type === 'shidoBoth' || type === 'hansokuMakeBoth' || type === 'timeUp') {
    return { type };
  }
  if (side === null) {
    return null;
  }

  switch (type) {
    case 'ippon':
    case 'wazaAri':
    case 'yuko':
      return { type: 'score', side, score: type };
    case 'shido':
    case 'shidoRemoved':
    case 'hansokuMake':
      return { type, side };
    case 'kikenGachi':
      return { type, withdrawnSide: side };
    case 'fusenGachi':
      return { type, absentSide: side };
    case 'decision':
      return { type, winner: side };
    default:
      return null;
  }
}
