/**
 * =====================================================
 * FILE: backupTables.ts
 * PURPOSE: Describes each table that goes in a backup. Only
 *          these names ever reach the SQL, never a name
 *          from a file, so a backup can't inject anything.
 * USED BY: the backup feature
 * =====================================================
 */

export const BACKUP_APP_NAME = 'judo-tournament';

// The first database version that backups exist for. Update it only if a step for an
// older version is ever dropped from migrateBackup.ts.
export const OLDEST_BACKUP_VERSION = 5;

export type ColumnKind = 'text' | 'textOrNull' | 'number' | 'numberOrNull';

export type BackupTable = {
  key: BackupTableKey;
  sqlName: string;
  columns: Readonly<Record<string, ColumnKind>>;
};

export type BackupTableKey =
  | 'ruleSets'
  | 'ageClasses'
  | 'weightTemplates'
  | 'clubs'
  | 'athletes'
  | 'tournaments'
  | 'categories'
  | 'entries'
  | 'draws'
  | 'matches'
  | 'matchEvents';

export type BackupRow = Record<string, string | number | null>;

export type BackupData = Record<BackupTableKey, BackupRow[]>;

/** The envelope around a backup's data. */
export type Backup = {
  app: typeof BACKUP_APP_NAME;
  schemaVersion: number;
  exportedAt: string;
  // A file with one tournament can only be merged, because replacing everything with
  // it would delete every other tournament.
  scope: 'all' | 'tournament';
  data: BackupData;
};

// RULE: parents before children, because rows are inserted in this order and deleted
// in the reverse order. Otherwise, the foreign keys would refuse them.
export const BACKUP_TABLES: readonly BackupTable[] = [
  {
    key: 'ruleSets',
    sqlName: 'rule_sets',
    columns: {
      id: 'text',
      name: 'text',
      hasWazaAriAwaseteIppon: 'number',
      shidosForHansokuMake: 'number',
      osaekomiSecondsYuko: 'numberOrNull',
      osaekomiSecondsWazaAri: 'number',
      osaekomiSecondsIppon: 'number',
      goldenScoreWonByShido: 'number',
    },
  },
  {
    key: 'ageClasses',
    sqlName: 'age_classes',
    columns: {
      id: 'text',
      name: 'text',
      minAge: 'numberOrNull',
      maxAge: 'numberOrNull',
      matchSeconds: 'number',
      hasGoldenScore: 'number',
      goldenScoreMaxSeconds: 'numberOrNull',
      isYukoEnabled: 'number',
      weightToleranceGrams: 'number',
      hasWeightCategories: 'number',
      isVerified: 'number',
      sortOrder: 'number',
    },
  },
  {
    key: 'weightTemplates',
    sqlName: 'weight_templates',
    columns: {
      id: 'text',
      ageClassId: 'text',
      sex: 'text',
      label: 'text',
      minKg: 'numberOrNull',
      maxKg: 'numberOrNull',
      sortOrder: 'number',
    },
  },
  { key: 'clubs', sqlName: 'clubs', columns: { id: 'text', name: 'text' } },
  {
    key: 'athletes',
    sqlName: 'athletes',
    columns: {
      id: 'text',
      name: 'text',
      clubId: 'textOrNull',
      birthYear: 'number',
      sex: 'text',
      belt: 'textOrNull',
      notes: 'textOrNull',
    },
  },
  {
    key: 'tournaments',
    sqlName: 'tournaments',
    columns: {
      id: 'text',
      name: 'text',
      date: 'text',
      place: 'textOrNull',
      seasonYear: 'number',
      ruleSetId: 'text',
      isArchived: 'number',
    },
  },
  {
    key: 'categories',
    sqlName: 'categories',
    columns: {
      id: 'text',
      tournamentId: 'text',
      ageClassId: 'textOrNull',
      sex: 'text',
      label: 'text',
      minKg: 'numberOrNull',
      maxKg: 'numberOrNull',
      format: 'text',
      isFreeGrouping: 'number',
    },
  },
  {
    key: 'entries',
    sqlName: 'entries',
    columns: {
      id: 'text',
      athleteId: 'text',
      categoryId: 'text',
      declaredKg: 'numberOrNull',
      weighedKg: 'numberOrNull',
      isWeighedIn: 'number',
      status: 'text',
      seed: 'numberOrNull',
      drawPosition: 'numberOrNull',
      pouleNumber: 'numberOrNull',
    },
  },
  {
    key: 'draws',
    sqlName: 'draws',
    columns: {
      id: 'text',
      categoryId: 'text',
      seed: 'text',
      isLocked: 'number',
      entryCount: 'numberOrNull',
    },
  },
  {
    key: 'matches',
    sqlName: 'matches',
    columns: {
      id: 'text',
      categoryId: 'text',
      round: 'number',
      slot: 'number',
      bracketPart: 'text',
      pouleNumber: 'numberOrNull',
      whiteEntryId: 'textOrNull',
      blueEntryId: 'textOrNull',
      winnerEntryId: 'textOrNull',
      resultType: 'textOrNull',
      isGoldenScore: 'number',
      whiteIppons: 'number',
      whiteWazaAris: 'number',
      whiteYukos: 'number',
      whiteShidos: 'number',
      blueIppons: 'number',
      blueWazaAris: 'number',
      blueYukos: 'number',
      blueShidos: 'number',
      clockElapsedSeconds: 'number',
      clockStartedAtMs: 'numberOrNull',
      durationSeconds: 'numberOrNull',
      status: 'text',
      winnerNextMatchId: 'textOrNull',
      winnerNextSide: 'textOrNull',
      loserNextMatchId: 'textOrNull',
      loserNextSide: 'textOrNull',
      matchKey: 'textOrNull',
      osaekomiSide: 'textOrNull',
      osaekomiStartedAtMs: 'numberOrNull',
    },
  },
  {
    key: 'matchEvents',
    sqlName: 'match_events',
    columns: {
      id: 'text',
      matchId: 'text',
      sequence: 'number',
      type: 'text',
      side: 'textOrNull',
      clockSeconds: 'number',
    },
  },
];
