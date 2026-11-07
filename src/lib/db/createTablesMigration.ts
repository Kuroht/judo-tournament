/**
 * =====================================================
 * FILE: createTablesMigration.ts
 * PURPOSE: The SQL that creates every table in the app.
 * USED BY: migrations.ts
 * =====================================================
 */

// ---------------------------------------------
// SECTION: Conventions used below
// ---------------------------------------------

// 1. Ids are text, not auto-increment numbers. Two tablets could both create
//    "athlete 5", which would clash when merging a JSON backup. See createId.ts.
// 2. SQLite has no boolean type, so booleans are INTEGER, either 0 or 1.
// 3. CHECK rules stop invalid values from ever reaching the database.
// 4. ON DELETE says what happens to a row when the row it points to is deleted:
//    CASCADE deletes it too, SET NULL clears the link, and RESTRICT blocks the delete.
export const CREATE_TABLES_SQL = `
  CREATE TABLE clubs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE athletes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    clubId TEXT REFERENCES clubs(id) ON DELETE RESTRICT,
    birthYear INTEGER NOT NULL,
    sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
    belt TEXT,
    notes TEXT
  );

  -- Rules that apply to every age class in a tournament.
  CREATE TABLE rule_sets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hasWazaAriAwaseteIppon INTEGER NOT NULL CHECK (hasWazaAriAwaseteIppon IN (0, 1)),
    shidosForHansokuMake INTEGER NOT NULL,
    osaekomiSecondsYuko INTEGER,
    osaekomiSecondsWazaAri INTEGER NOT NULL,
    osaekomiSecondsIppon INTEGER NOT NULL,
    goldenScoreWonByShido INTEGER NOT NULL CHECK (goldenScoreWonByShido IN (0, 1))
  );

  -- Rules that change with age. maxAge is NULL when there is no upper limit.
  CREATE TABLE age_classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    minAge INTEGER,
    maxAge INTEGER,
    matchSeconds INTEGER NOT NULL,
    hasGoldenScore INTEGER NOT NULL CHECK (hasGoldenScore IN (0, 1)),
    goldenScoreMaxSeconds INTEGER,
    isYukoEnabled INTEGER NOT NULL CHECK (isYukoEnabled IN (0, 1)),
    weightToleranceGrams INTEGER NOT NULL,
    hasWeightCategories INTEGER NOT NULL CHECK (hasWeightCategories IN (0, 1)),
    isVerified INTEGER NOT NULL CHECK (isVerified IN (0, 1)),
    sortOrder INTEGER NOT NULL
  );

  -- The editable list of weights that new tournament categories are copied from.
  CREATE TABLE weight_templates (
    id TEXT PRIMARY KEY,
    ageClassId TEXT NOT NULL REFERENCES age_classes(id) ON DELETE CASCADE,
    sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
    label TEXT NOT NULL,
    minKg REAL,
    maxKg REAL,
    sortOrder INTEGER NOT NULL
  );

  CREATE TABLE tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    place TEXT,
    seasonYear INTEGER NOT NULL,
    ruleSetId TEXT NOT NULL REFERENCES rule_sets(id) ON DELETE RESTRICT,
    isArchived INTEGER NOT NULL DEFAULT 0 CHECK (isArchived IN (0, 1))
  );

  CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    tournamentId TEXT NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    ageClassId TEXT REFERENCES age_classes(id) ON DELETE SET NULL,
    sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'mixed')),
    label TEXT NOT NULL,
    minKg REAL,
    maxKg REAL,
    format TEXT NOT NULL CHECK (format IN (
      'doubleRepechage', 'quarterFinalRepechage', 'poule', 'twoPoules', 'directKnockout'
    )),
    isFreeGrouping INTEGER NOT NULL DEFAULT 0 CHECK (isFreeGrouping IN (0, 1))
  );

  -- One athlete taking part in one category.
  CREATE TABLE entries (
    id TEXT PRIMARY KEY,
    athleteId TEXT NOT NULL REFERENCES athletes(id) ON DELETE RESTRICT,
    categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    declaredKg REAL,
    weighedKg REAL,
    isWeighedIn INTEGER NOT NULL DEFAULT 0 CHECK (isWeighedIn IN (0, 1)),
    status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN (
      'registered', 'passed', 'failed', 'noShow', 'withdrawn'
    )),
    seed INTEGER,
    drawPosition INTEGER,
    pouleNumber INTEGER,
    UNIQUE (athleteId, categoryId)
  );

  CREATE TABLE draws (
    id TEXT PRIMARY KEY,
    categoryId TEXT NOT NULL UNIQUE REFERENCES categories(id) ON DELETE CASCADE,
    seed TEXT NOT NULL,
    isLocked INTEGER NOT NULL DEFAULT 0 CHECK (isLocked IN (0, 1))
  );

  CREATE TABLE matches (
    id TEXT PRIMARY KEY,
    categoryId TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    slot INTEGER NOT NULL,
    bracketPart TEXT NOT NULL CHECK (bracketPart IN (
      'main', 'repechage', 'bronze', 'poule', 'semiFinal', 'final'
    )),
    pouleNumber INTEGER,
    whiteEntryId TEXT REFERENCES entries(id) ON DELETE SET NULL,
    blueEntryId TEXT REFERENCES entries(id) ON DELETE SET NULL,
    -- NULL even when finished, because both athletes can lose (double hansoku-make).
    winnerEntryId TEXT REFERENCES entries(id) ON DELETE SET NULL,
    resultType TEXT CHECK (resultType IN (
      'ippon', 'wazaAriAwasete', 'wazaAri', 'yuko', 'hansokuMake',
      'kikenGachi', 'fusenGachi', 'decision'
    )),
    isGoldenScore INTEGER NOT NULL DEFAULT 0 CHECK (isGoldenScore IN (0, 1)),
    whiteIppons INTEGER NOT NULL DEFAULT 0,
    whiteWazaAris INTEGER NOT NULL DEFAULT 0,
    whiteYukos INTEGER NOT NULL DEFAULT 0,
    whiteShidos INTEGER NOT NULL DEFAULT 0,
    blueIppons INTEGER NOT NULL DEFAULT 0,
    blueWazaAris INTEGER NOT NULL DEFAULT 0,
    blueYukos INTEGER NOT NULL DEFAULT 0,
    blueShidos INTEGER NOT NULL DEFAULT 0,
    -- The timer survives closing the app: time already used, plus when it last
    -- started (NULL while paused). The real time left is calculated from these.
    clockElapsedSeconds INTEGER NOT NULL DEFAULT 0,
    clockStartedAtMs INTEGER,
    durationSeconds INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'finished')),
    -- Where the winner and loser go next in the bracket.
    winnerNextMatchId TEXT REFERENCES matches(id) ON DELETE SET NULL,
    winnerNextSide TEXT CHECK (winnerNextSide IN ('white', 'blue')),
    loserNextMatchId TEXT REFERENCES matches(id) ON DELETE SET NULL,
    loserNextSide TEXT CHECK (loserNextSide IN ('white', 'blue'))
  );

  -- Every scoring action in a match, in order. Undo removes the last one.
  CREATE TABLE match_events (
    id TEXT PRIMARY KEY,
    matchId TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    sequence INTEGER NOT NULL,
    type TEXT NOT NULL,
    side TEXT CHECK (side IN ('white', 'blue')),
    clockSeconds INTEGER NOT NULL,
    UNIQUE (matchId, sequence)
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  -- SQLite does not create indexes for foreign keys by itself.
  CREATE INDEX athletes_club ON athletes(clubId);
  CREATE INDEX weight_templates_age_class ON weight_templates(ageClassId);
  CREATE INDEX categories_tournament ON categories(tournamentId);
  CREATE INDEX entries_category ON entries(categoryId);
  CREATE INDEX matches_category ON matches(categoryId);
`;
