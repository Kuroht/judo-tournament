# Prompt: Offline Judo Tournament App (Expo + TypeScript, Portuguese style)

Copy everything below the line into a new chat with your AI coding assistant.

---

## 0. Your role and how we work

You are my senior mentor and pair programmer. I am Nathan, a web developer learning React Native. I will use this app, and my judo trainer will use it at real tournaments, so it must be reliable and simple.

Working rules:

1. **Do not write code yet.** First read this whole prompt, then ask me every question listed in section 14 that is still unanswered. Wait for my answers.
2. **Build in small steps** (section 12). After each step: show the files, explain in 3 to 5 sentences what they do and why, give me a short manual test checklist, then **stop and wait for me to say "next"**.
3. **Never install a package without asking.** Before step 1, list every dependency you want, with one line of justification each, and wait for my approval. No "just in case" packages.
4. If something in this prompt is wrong, unclear or contradicts the current Expo docs, say so and propose a fix instead of guessing.
5. Check the current Expo SDK, Expo Router and NativeWind docs before writing setup code. Do not rely on memory for install commands or config files.

## 1. Goal

A **100% offline** Expo app (iOS and Android) to run **judo tournaments in the Portuguese style**. One person (the trainer) uses it on a phone or tablet at the tables. It manages athletes, clubs, categories, weigh-in, the draw, matches with a timer and scoring, results and final rankings. All data is stored on the device and can be **exported and imported as a JSON file**.

The UI must be available in **Portuguese (PT-PT) and English**, switchable in settings.

## 2. Hard constraints

- Works with **no internet**, ever. No network calls, no analytics, no remote fonts, no accounts.
- **Keep it vanilla.** Use React Native and Expo built-ins first. Write small helpers yourself instead of adding a library.
- Allowed dependencies (still ask before installing each one):
  - `expo-sqlite` (database)
  - `expo-file-system`, `expo-sharing`, `expo-document-picker` (JSON import and export)
  - `expo-print` (printable bracket and results PDF)
  - `expo-keep-awake` (screen stays on during a match timer)
  - Expo Router (file-based navigation; it is part of the default Expo template, so it is not an extra install if we start from that template)
  - Tailwind styling through NativeWind (and whatever NativeWind itself requires, according to its current docs)
- No state library (no Redux, Zustand). Use `useState`, `useReducer`, context where needed, and small custom hooks that read from SQLite.
- No i18n library. Use a tiny translation helper with two plain objects (`pt` and `en`).
- TypeScript **strict mode**, no `any`. Use `unknown` and narrow it.

## 3. Code style (follow my course repo)

Follow the conventions of https://github.com/Kuroht/learn-react (see `CONTRIBUTING.md` and `docs/architecture.md`), adapted to React Native:

| Thing | Convention |
| --- | --- |
| Component files | `PascalCase.tsx`, one component per file |
| Hooks | `camelCase.ts`, start with `use` (`useTournament.ts`) |
| Utility files | `camelCase.ts` |
| Folders | `kebab-case` |
| Props types | `type ComponentNameProps` |
| Booleans | start with `is`, `has`, `can` |
| Event handler props / functions | `onSomething` / `handleSomething` |
| Constants | `UPPER_SNAKE_CASE` |
| Exports | **named exports** (default exports only where Expo Router requires them for screens) |

Principles:

- Function components only. Small components, one job each. If a component passes about 100 lines, split it.
- **Logic in hooks and pure functions, presentation in components.**
- Model states with discriminated unions, not several booleans.
- Organize by **feature**, and start inside the feature; move code to shared folders only when a second feature needs it.
- Calculate derived data during render instead of storing it in state.
- No giant `utils.ts`. Split by purpose.

### Comment style (very important, I am learning from this code)

Write **beginner-friendly, well-structured comments** in English. Comment the *why*, not just the *what*.

Every file starts with a header block:

```ts
/**
 * =====================================================
 * FILE: buildKnockoutBracket.ts
 * PURPOSE: Builds the match list for a single-elimination
 *          bracket with repechage.
 * USED BY: draw screen, category screen
 * =====================================================
 */
```

Inside files, group code with section banners and explain non-obvious steps in numbered comments:

```ts
// ---------------------------------------------
// SECTION: Helpers
// ---------------------------------------------

// 1. Find the next power of two (8 athletes -> 8, 11 athletes -> 16).
//    We need it because the bracket always has 2, 4, 8, 16... slots.
```

Rules: every exported function has a short doc comment (what it receives, what it returns, one example when helpful). Keep comments truthful: when code changes, update the comment. Do not comment obvious lines like `i++`.

> Nathan: if your course uses a different comment template, paste one file here and ask the AI to copy it exactly.

## 4. Folder structure

Start from the default Expo TypeScript template with Expo Router. Target structure:

```
src/
├── app/                      # Expo Router screens (thin: they only compose features)
│   ├── _layout.tsx
│   ├── (tabs)/
│   │   ├── index.tsx         # Tournaments list
│   │   ├── athletes.tsx
│   │   └── settings.tsx
│   └── tournament/[id]/      # one tournament: overview, categories, weigh-in, draw, matches, results
├── features/
│   ├── tournaments/
│   ├── athletes/
│   ├── clubs/
│   ├── categories/
│   ├── weigh-in/
│   ├── draw/
│   ├── matches/              # scoring + timer
│   ├── results/              # rankings, medal table, PDF
│   └── backup/               # JSON import and export
│       (each feature: components/, hooks/, db/, types.ts, index.ts)
├── components/               # generic UI: Button, Card, Modal, Input, BigCounter...
├── hooks/                    # shared hooks
├── lib/
│   ├── db/                   # open database, migrations, tiny query helpers
│   ├── rules/                # judo rules + RuleSet (pure functions)
│   ├── brackets/             # bracket and poule generators (pure functions)
│   ├── i18n/                 # pt.ts, en.ts, useT.ts
│   └── constants/
└── types/
```

Features talk to each other only through their `index.ts`. Keep all bracket and rules logic as **pure functions** (no React, no database) so they are easy to test.

## 5. Judo rules (configurable, with sensible defaults)

I asked you to study the proper rules. What I verified before writing this prompt, from IJF material:

- The IJF scoring uses **ippon** and **waza-ari** only. Yuko was merged into waza-ari in the 2018 rule set.
- **Two waza-ari = ippon** (waza-ari-awasete-ippon) and the match ends.
- Osaekomi (hold-down): **10 seconds = waza-ari, 20 seconds = ippon**.
- **Three shido = hansoku-make** (loss). A penalty is never a score. Direct hansoku-make is also possible.
- If there is no score or scores are tied at the end of regular time, the match goes to **golden score**; scores and shidos from regular time stay on the board.
- Some IJF explanation documents say golden score can be won only by a technical score or hansoku-make, not by shido difference. Some local rule sets for kids (for example Ontario) still use **yuko**, and no golden score for young age groups.

I could not confirm the exact current-year FPJ text, so **do not hard-code any of this**. Implement a `RuleSet` object and a default preset:

```ts
type RuleSet = {
  isYukoEnabled: boolean;            // default false (IJF), true for local or kids rules
  hasWazaAriAwaseteIppon: boolean;   // default true (two waza-ari end the match)
  shidosForHansokuMake: number;      // default 3
  osaekomiSecondsYuko: number | null;
  osaekomiSecondsWazaAri: number;    // default 10
  osaekomiSecondsIppon: number;      // default 20
  hasGoldenScore: boolean;           // default true
  goldenScoreWonByShido: boolean;    // default false, ask me which one the FPJ uses
  matchSeconds: number;              // default by age class, editable
  goldenScoreMaxSeconds: number | null; // null = unlimited
};
```

Rules per **age class** (match duration, golden score yes or no, yuko yes or no) must be stored in the database and editable in settings. Ask me for the FPJ durations per age class, or propose defaults and mark them clearly as "to verify".

Match result types to support: `ippon`, `wazaAriAwasete`, `wazaAri` (higher score at the end), `yuko` (only if enabled), `hansokuMake`, `kikenGachi` (opponent withdraws), `fusenGachi` (no-show), `goldenScore`, `decision` (manual override by the trainer).

## 6. Portuguese tournament format

### Categories and age classes

- Pre-load **FPJ age classes and weight categories** as editable seed data in a single file (`lib/constants/fpjCategories.ts`) with a comment at the top: `VERIFY AGAINST THE CURRENT FPJ REGULAMENTO (fpj.pt) BEFORE USE`.
- What I could verify: senior weights are the IJF ones, men **-60, -66, -73, -81, -90, -100, +100** and women **-48, -52, -57, -63, -70, -78, +78**. Recent FPJ circulars also show youth team weights such as men -60, -66, -73, -81, +81 and women -57, -63, -70, +70.
- What I could **not** verify: the current age class names and birth-year ranges (an older FPJ document used Benjamins, Juvenis, Juniores, Seniores, newer circulars also mention Cadetes), and the weights for the youngest classes. **Ask me to paste the official current table**, and compute the age class from `birthYear` and a `seasonYear` setting.
- Everything must be editable in the app: add, rename, delete categories and change limits.
- Some school and club tournaments in Portugal have **no fixed weight categories**: the real weight is recorded at weigh-in and athletes are grouped afterwards. Support a "free grouping" mode where the trainer creates groups from weighed athletes.

### Formats (the trainer chooses per category)

1. **Single elimination with repechage** (default). Implement the IJF-style structure: two halves (pools A and B), losers who lost against a finalist enter the repechage, **two bronze medals**. Explain your bracket algorithm with a worked example for 5, 8, 11 and 16 athletes and **get my confirmation** before coding it. Handle byes (higher seeds or random, setting).
2. **Double repechage** variant (used in Portuguese school regulations). Optional, behind a setting.
3. **Round-robin poule.** Everyone fights everyone. Ranking by wins, then technical score points, then direct confrontation. Ask me for the tie-break order and the points per result (propose a default, mark it "to verify"). Support 3 to 6 athletes per poule and multiple poules per category.
4. **Single elimination with only 2 bronze matches and no repechage** (optional, later).

### Draw (sorteio)

- Random draw with a visible **seed** value, so a draw can be reproduced and shown to coaches.
- **Club separation:** try to avoid same-club athletes meeting in round one. Explain the algorithm; it is best effort and must say when it could not separate everyone.
- Manual seeds and manual swaps before the draw is **locked**. After lock, only the trainer can unlock with a confirmation.

## 7. Data model (SQLite)

Ask me to approve this before coding. Suggested tables: `clubs`, `athletes` (name, clubId, birthYear, sex, belt optional, notes), `tournaments` (name, date, place, seasonYear, language, ruleSetId), `categories` (tournamentId, ageClass, sex, label, minKg, maxKg, format), `entries` (athleteId, categoryId, declaredKg, weighedKg, isWeighedIn, status), `draws` (categoryId, seed, isLocked), `matches` (categoryId, round, slot, bracketPart, whiteEntryId, blueEntryId, winnerEntryId, resultType, scores, shidos, durationSeconds, status), `rule_sets`, `settings`, `schema_version`.

Requirements: foreign keys on, **migrations with a version number**, all writes in transactions, no raw SQL scattered in components (queries live in each feature's `db/` folder).

## 8. Features

1. **Clubs and athletes:** create, edit, delete, search, filter by club.
2. **Tournaments:** create, duplicate, archive.
3. **Categories:** pre-loaded from FPJ seed, editable, choose format.
4. **Registration:** add athletes to categories; warn when age or sex does not match.
5. **Weigh-in:** a fast list screen with big number input, pass or fail against the limit, **move athlete to the correct category** when over or under, mark as no-show.
6. **Draw:** per category, lock and unlock, show bracket or poules.
7. **Match screen (the most important):**
   - Big, readable white and blue sides with athlete name and club.
   - Big buttons: ippon, waza-ari, shido (+/-), yuko if enabled, osaekomi timer.
   - Match timer with **start, pause, reset**; the trainer can ignore it and just enter the result.
   - Golden score starts automatically when needed, with a clear label.
   - Undo last action. Confirmation before finishing a match.
8. **Match list:** pending, running, finished; next match highlighted; edit a finished result safely (recalculates the bracket).
9. **Results:** final ranking per category (1st, 2nd, two 3rds, 5ths), **medal table by club**, and athlete history.
10. **Printable PDF:** brackets, poules and results via `expo-print`.
11. **Settings:** language, season year, rule presets per age class, dark mode, data tools.

## 9. UX requirements (it must be easy to use)

- Used standing at a table, possibly with one hand: **big touch targets** (at least 48 dp, bigger on the match screen), high contrast, readable at arm's length.
- **Light and dark mode.** Judo colors for white and blue sides are consistent everywhere.
- Few taps: the next action is always the most visible button.
- Destructive actions (delete, unlock draw, import that replaces data) always ask for confirmation and say clearly what will be lost.
- **Auto-save everything.** Closing the app mid-match must not lose the match state, including the timer value.
- Empty states with a helpful sentence and a button, never a blank screen.
- Works on small phones and tablets (responsive layout, no horizontal scroll).
- Accessible: labels on inputs, readable font sizes, not color-only status.

## 10. JSON import and export

- **Export:** one JSON file with an envelope: `{ app: "judo-tournament", schemaVersion, exportedAt, data: { clubs, athletes, tournaments, ... } }`. Use `expo-file-system` to write it to the cache and `expo-sharing` to send or save it. File name includes the date.
- Options: export **everything** or **one tournament** (with its athletes, clubs, categories, matches).
- **Import:** pick a file with `expo-document-picker`, then:
  1. Parse safely (try/catch) and **validate the shape** by hand with small type guard functions (no schema library).
  2. Check `app` and `schemaVersion`; migrate older versions with a function per version.
  3. Show a **preview** (counts of clubs, athletes, tournaments) and let me choose **Replace all** or **Merge** (with a clear rule for duplicate ids).
  4. **Create an automatic backup file** before replacing anything.
  5. Run the whole import in a **transaction**; on any error, roll back and show a readable message.
- Write unit-testable pure functions for `validateBackup`, `migrateBackup`, `mergeBackup`.

## 11. Quality

- Pure logic in `lib/rules` and `lib/brackets` gets example-based tests. If you want a test runner, ask me first (Expo's default is `jest-expo`).
- Handle loading, error and empty states in every list.
- Every step ends with a **manual test checklist** I can follow on my phone (include an offline test with airplane mode on).
- No console errors or warnings left behind.

## 12. Build order (stop after each step and wait for "next")

0. Questions, dependency list, and approval of folder structure and data model.
1. Project setup: Expo template, TypeScript strict, Expo Router, NativeWind, folder structure, i18n helper, theme (light and dark), empty tab screens.
2. Database: open, migrations, `schema_version`, query helpers, seed data.
3. Clubs and athletes (full CRUD).
4. Tournaments and categories (with FPJ seed).
5. Registration of athletes into categories.
6. Weigh-in.
7. `RuleSet` and rules logic (pure functions) with examples.
8. Bracket generator: single elimination with repechage (worked examples first), then draw with club separation and lock.
9. Round-robin poule generator and ranking.
10. Match screen: scoring, shido, osaekomi, timer, golden score, undo.
11. Match list, bracket progression, editing finished results.
12. Results, rankings, medal table.
13. JSON export and import (validation, preview, backup, transaction).
14. PDF printing, settings polish, accessibility pass, final offline test, README for me (how to run, build, and back up data).

## 13. Output format for each step

1. One sentence: what we are building now.
2. Files created or changed (full paths) with the **complete code**, following the comment style above.
3. Plain-language explanation (3 to 5 sentences) of the key idea.
4. Manual test checklist.
5. "Ready for the next step? Anything you want changed?"

## 14. Questions you must ask me before step 1

- Which Expo SDK and Expo Router version does my machine have? (Ask me to run `npx expo --version` and `node -v`.)
- Please show me the dependency list and wait for approval.
- Do I want to start from the default Expo template (with Expo Router) or a blank template?
- The official **current FPJ table** of age classes, birth years and weight categories: can I paste it? Should I enable youth classes without weight categories?
- Match durations and golden score rules per age class, and whether the FPJ golden score can be won by shido.
- Poule tie-break order and points per result.
- Is the bracket structure (pools A and B, repechage, two bronze) right, after you show me the worked example?
- Do I want the match timer to also play a sound or vibrate at the end of time? (Needs one more small package, so it is optional.)
- Which devices will the trainer use (iPhone, Android, tablet), so we test on the right one?