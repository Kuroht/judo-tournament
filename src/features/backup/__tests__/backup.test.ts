/**
 * =====================================================
 * FILE: backup.test.ts
 * PURPOSE: Checks validating, upgrading, merging and cutting
 *          down backups.
 * USED BY: npm test
 * =====================================================
 */
import {
  describeAutomaticBackup,
  getFullBackupName,
  getTournamentBackupName,
} from '../backupFileNames';
import { BACKUP_TABLES, type BackupData, type BackupRow } from '../backupTables';
import { mergeBackup } from '../mergeBackup';
import { migrateBackup } from '../migrateBackup';
import { pickTournament } from '../pickTournament';
import { validateBackup } from '../validateBackup';

const VERSION = 5;

/** Fills a row with valid values for its table, then applies the overrides. */
function rowFor(key: BackupData extends Record<infer K, unknown> ? K : never, values: BackupRow) {
  const table = BACKUP_TABLES.find((other) => other.key === key);
  const row: BackupRow = {};

  for (const [column, kind] of Object.entries(table?.columns ?? {})) {
    if (kind === 'text') {
      row[column] = 'x';
    } else if (kind === 'number') {
      row[column] = 0;
    } else {
      row[column] = null;
    }
  }

  return { ...row, ...values };
}

function emptyData(): BackupData {
  return {
    ruleSets: [],
    ageClasses: [],
    weightTemplates: [],
    clubs: [],
    athletes: [],
    tournaments: [],
    categories: [],
    entries: [],
    draws: [],
    matches: [],
    matchEvents: [],
  };
}

/** Two tournaments, each with an athlete, a category, an entry, a draw, a match and an event. */
function twoTournaments(): BackupData {
  const data = emptyData();
  data.ruleSets = [rowFor('ruleSets', { id: 'rules1' }), rowFor('ruleSets', { id: 'rulesUnused' })];
  data.ageClasses = [rowFor('ageClasses', { id: 'age1' }), rowFor('ageClasses', { id: 'age2' })];
  data.weightTemplates = [
    rowFor('weightTemplates', { id: 'w1', ageClassId: 'age1' }),
    rowFor('weightTemplates', { id: 'w2', ageClassId: 'age2' }),
  ];
  data.clubs = [rowFor('clubs', { id: 'club1' }), rowFor('clubs', { id: 'club2' })];
  data.athletes = [
    rowFor('athletes', { id: 'a1', clubId: 'club1' }),
    rowFor('athletes', { id: 'a2', clubId: 'club2' }),
    rowFor('athletes', { id: 'aUnused', clubId: null }),
  ];
  data.tournaments = [
    rowFor('tournaments', { id: 't1', ruleSetId: 'rules1' }),
    rowFor('tournaments', { id: 't2', ruleSetId: 'rules1' }),
  ];
  data.categories = [
    rowFor('categories', { id: 'c1', tournamentId: 't1', ageClassId: 'age1' }),
    rowFor('categories', { id: 'c2', tournamentId: 't2', ageClassId: 'age2' }),
  ];
  data.entries = [
    rowFor('entries', { id: 'e1', athleteId: 'a1', categoryId: 'c1' }),
    rowFor('entries', { id: 'e2', athleteId: 'a2', categoryId: 'c2' }),
  ];
  data.draws = [
    rowFor('draws', { id: 'd1', categoryId: 'c1' }),
    rowFor('draws', { id: 'd2', categoryId: 'c2' }),
  ];
  data.matches = [
    rowFor('matches', { id: 'm1', categoryId: 'c1' }),
    rowFor('matches', { id: 'm2', categoryId: 'c2' }),
  ];
  data.matchEvents = [
    rowFor('matchEvents', { id: 'ev1', matchId: 'm1' }),
    rowFor('matchEvents', { id: 'ev2', matchId: 'm2' }),
  ];

  return data;
}

function fileWith(overrides: Record<string, unknown> = {}, data: unknown = twoTournaments()) {
  return JSON.stringify({
    app: 'judo-tournament',
    schemaVersion: VERSION,
    exportedAt: '2026-11-07T10:00:00.000Z',
    scope: 'all',
    data,
    ...overrides,
  });
}

describe('validateBackup', () => {
  it('accepts a good file', () => {
    const check = validateBackup(fileWith(), VERSION);

    expect(check.type).toBe('valid');
  });

  it.each([
    ['text that is not JSON', 'hello', 'notJson'],
    ['an empty file', '', 'notJson'],
    ['JSON that is a list', '[]', 'wrongApp'],
    ['JSON that is null', 'null', 'wrongApp'],
    ['a file from another app', fileWith({ app: 'other' }), 'wrongApp'],
    ['a file from a newer version', fileWith({ schemaVersion: VERSION + 1 }), 'newerVersion'],
    ['a file from before backups existed', fileWith({ schemaVersion: 4 }), 'tooOld'],
  ])('refuses %s', (_name, text, problem) => {
    expect(validateBackup(text, VERSION)).toMatchObject({ type: 'invalid', problem });
  });

  it('refuses a missing table, and says which', () => {
    const { clubs: _clubs, ...data } = twoTournaments();

    expect(validateBackup(fileWith({}, data), VERSION)).toEqual({
      type: 'invalid',
      problem: 'damaged',
      details: 'clubs',
    });
  });

  it('refuses a wrong type, and says where', () => {
    const data = twoTournaments();
    data.athletes[1] = { ...data.athletes[1], birthYear: 'old' };

    expect(validateBackup(fileWith({}, data), VERSION)).toEqual({
      type: 'invalid',
      problem: 'damaged',
      details: 'athletes, 2, birthYear',
    });
  });

  it('refuses a missing column, even one that can be empty', () => {
    const data = twoTournaments();
    const { clubId: _clubId, ...athlete } = data.athletes[0] as BackupRow;
    data.athletes[0] = athlete;

    expect(validateBackup(fileWith({}, data), VERSION)).toMatchObject({ problem: 'damaged' });
  });

  it('refuses a negative number', () => {
    const data = twoTournaments();
    data.athletes[0] = { ...data.athletes[0], birthYear: -1 };

    expect(validateBackup(fileWith({}, data), VERSION)).toMatchObject({
      problem: 'damaged',
      details: 'athletes, 1, birthYear',
    });
  });

  it('refuses absurdly long text', () => {
    const data = twoTournaments();
    data.clubs[0] = { ...data.clubs[0], name: 'x'.repeat(5001) };

    expect(validateBackup(fileWith({}, data), VERSION)).toMatchObject({
      problem: 'damaged',
      details: 'clubs, 1, name',
    });
  });

  it('refuses two rows with one id', () => {
    const data = twoTournaments();
    data.clubs = [rowFor('clubs', { id: 'same' }), rowFor('clubs', { id: 'same' })];

    expect(validateBackup(fileWith({}, data), VERSION)).toMatchObject({
      problem: 'damaged',
      details: 'clubs, 2, id',
    });
  });

  it('drops a column it does not know, so that it never reaches the SQL', () => {
    const data = twoTournaments();
    data.clubs = [{ ...rowFor('clubs', { id: 'c' }), 'name; DROP TABLE clubs': 'x' }];
    const check = validateBackup(fileWith({}, data), VERSION);

    expect(check.type === 'valid' && Object.keys(check.backup.data.clubs[0] ?? {})).toEqual([
      'id',
      'name',
    ]);
  });
});

describe('upgrading a real older backup', () => {
  it('reads a version 5 file, whose matches have no saved rules', () => {
    const data = twoTournaments();
    data.matches = data.matches.map(({ rulesJson: _rulesJson, ...match }) => match);
    const check = validateBackup(fileWith({ schemaVersion: 5 }, data), 6);

    expect(check.type === 'valid' && check.backup.data.matches[0]?.rulesJson).toBeNull();
    expect(check.type === 'valid' && check.backup.schemaVersion).toBe(6);
  });
});

describe('migrateBackup', () => {
  it('runs every step in order', () => {
    const steps = {
      5: (data: unknown) => `${String(data)}+6`,
      6: (data: unknown) => `${String(data)}+7`,
    };

    expect(migrateBackup('v5', 5, 7, steps)).toBe('v5+6+7');
  });

  it('changes nothing when already current', () => {
    expect(migrateBackup('v5', 5, 5)).toBe('v5');
  });

  it('gives up if a step is missing', () => {
    expect(migrateBackup('v5', 5, 6, {})).toBeNull();
  });

  it('gives up on a version before backups existed', () => {
    expect(migrateBackup('v4', 4, 5)).toBeNull();
  });
});

describe('mergeBackup', () => {
  it('adds everything to an empty tablet', () => {
    const incoming = twoTournaments();
    const { toAdd, skippedTournaments } = mergeBackup(emptyData(), incoming);

    expect(toAdd).toEqual(incoming);
    expect(skippedTournaments).toBe(0);
  });

  it('adds nothing when the same file is merged twice', () => {
    const data = twoTournaments();
    const { toAdd, skippedTournaments } = mergeBackup(data, data);

    expect(Object.values(toAdd).every((rows) => rows.length === 0)).toBe(true);
    expect(skippedTournaments).toBe(2);
  });

  it('keeps the version on this tablet when an id already exists', () => {
    const existing = emptyData();
    existing.clubs = [rowFor('clubs', { id: 'club1', name: 'Mine' })];
    const { toAdd } = mergeBackup(existing, twoTournaments());

    expect(toAdd.clubs.map((row) => row.id)).toEqual(['club2']);
  });

  it('skips everything inside a tournament that already exists', () => {
    const existing = emptyData();
    existing.tournaments = [rowFor('tournaments', { id: 't1' })];
    const { toAdd, skippedTournaments } = mergeBackup(existing, twoTournaments());

    expect(skippedTournaments).toBe(1);
    expect(toAdd.tournaments.map((row) => row.id)).toEqual(['t2']);
    expect(toAdd.categories.map((row) => row.id)).toEqual(['c2']);
    expect(toAdd.entries.map((row) => row.id)).toEqual(['e2']);
    expect(toAdd.draws.map((row) => row.id)).toEqual(['d2']);
    expect(toAdd.matches.map((row) => row.id)).toEqual(['m2']);
    expect(toAdd.matchEvents.map((row) => row.id)).toEqual(['ev2']);
  });
});

describe('pickTournament', () => {
  const picked = pickTournament(twoTournaments(), 't1');

  it('keeps only that tournament and what belongs to it', () => {
    expect(picked.tournaments.map((row) => row.id)).toEqual(['t1']);
    expect(picked.categories.map((row) => row.id)).toEqual(['c1']);
    expect(picked.entries.map((row) => row.id)).toEqual(['e1']);
    expect(picked.draws.map((row) => row.id)).toEqual(['d1']);
    expect(picked.matches.map((row) => row.id)).toEqual(['m1']);
    expect(picked.matchEvents.map((row) => row.id)).toEqual(['ev1']);
  });

  it('keeps what those rows refer to, and nothing else', () => {
    expect(picked.athletes.map((row) => row.id)).toEqual(['a1']);
    expect(picked.clubs.map((row) => row.id)).toEqual(['club1']);
    expect(picked.ruleSets.map((row) => row.id)).toEqual(['rules1']);
    expect(picked.ageClasses.map((row) => row.id)).toEqual(['age1']);
    expect(picked.weightTemplates.map((row) => row.id)).toEqual(['w1']);
  });
});

describe('file names', () => {
  const date = new Date('2026-11-07T10:00:00.000Z');

  it('shows an automatic backup as a date and time', () => {
    expect(describeAutomaticBackup('2026-11-07T10-30-05-123Z.json')).toMatch(
      /^2026-11-07 \d\d:\d\d$/,
    );
  });

  it('shows an unusual automatic backup name as it is', () => {
    expect(describeAutomaticBackup('other.json')).toBe('other.json');
  });

  it('puts the date in the name', () => {
    expect(getFullBackupName(date)).toBe('judo-tudo-2026-11-07.json');
  });

  it('removes accents and symbols', () => {
    expect(getTournamentBackupName('Taça de Lisboa!', date)).toBe(
      'judo-taca-de-lisboa-2026-11-07.json',
    );
  });

  it('still gives a name when only symbols are left', () => {
    expect(getTournamentBackupName('???', date)).toBe('judo-torneio-2026-11-07.json');
  });
});
