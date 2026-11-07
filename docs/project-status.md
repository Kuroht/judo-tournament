# Project status

Where the app stands, what is known to be wrong or untested, and which decisions were made and why. `PROMPT.md` is the full specification. Update this file at the end of each build step.

## Progress

| Step | What | Status |
| --- | --- | --- |
| 0 | Questions and approvals | Done |
| 1 | Project setup, language helper, themes, tabs | Done |
| 2 | Database, migrations, FPJ data | Done |
| 3 | Clubs and athletes | Done |
| 4 | Tournaments and categories | Done |
| 5 | Registration of athletes into categories | Done |
| 6 | Weigh-in | Done |
| 7 | Rules logic | Done |
| 8 | Bracket generator and draw | Done. The trainer still needs to validate `docs/regras-para-validar.md` |
| 9 | Poules and ranking | Done |
| 10 | Match screen | Done |
| 11 | Match list, bracket progression, correcting results | Done |
| 12 | Results, rankings, medal table | Done |
| 13 | JSON export and import | Done |
| 14 | PDF printing and final polish | Next |

## Known issues

### Critical: Android only lightly tested

The project owner ran steps 1 to 7 on Android with Expo Go for SDK 57, and reported that it worked. Automated tests still only cover web and logic. It hasn't yet run as an installed build, so **do not rely on it at a tournament until it has**.

Confirmed on Android by the project owner: the database and FPJ data, settings surviving a restart, the big weight text, the category list inside the weigh-in dialog, form fields staying above the keyboard, and the keyboard opening by itself in the weigh-in dialog.

Still to confirm on the device:

- The search box in the option picker staying above the keyboard.
- Long club names wrapping in the option picker.
- **Try again** on the error screen, which retries in place on Android and reloads the page on web.
- Accented text search and sorting (`normalize` and `localeCompare`).
- Working in airplane mode from an installed build. A development build still needs the computer.

### Expo Go may refuse the project

The project uses SDK 57, but Expo Go from the Play Store is for SDK 58 and refuses it. Uninstall that one, install the [Expo Go for SDK 57](https://expo.dev/go?sdkVersion=57&platform=android&device=true), and avoid updating it from the Play Store. Expo Go is only for testing, and still needs the computer. A tournament needs an installed build.

### Web: the database file can only be open once

On web, SQLite locks a browser storage file that only one page can hold.

- A quick reload can show the error screen, because the old page still holds the lock. **Try again** reloads the page and recovers. In one test run this appeared 4 times, and all 4 recovered.
- A second tab of the app shows the error screen until the first tab is closed. Use one tab.

This doesn't affect Android or iOS, which don't use this browser storage.

### Web: "System" theme doesn't follow changes live

The computer's theme is only read when the app opens or the option is chosen. This is web-only, and web is only used for testing.

### npm audit warnings

`npm audit` reports 7 issues, 3 of them high. The root high-severity packages are `query-string` and `decode-uri-component` (a denial-of-service bug on malformed URLs), which reach the app through `expo-router`. The suggested fixes mean changing Expo SDK, which breaks the NativeWind pairing below. The app takes no web traffic, so the risk is low. Check again before release.

### Smaller limits

- A renamed FPJ category counts as new, so adding its age class again recreates it.
- A sex with no weight templates gets a free group. This can't happen until templates are editable.
- Age classes and FPJ weight templates can't be edited in the app yet. Planned for step 14.
- New FPJ categories all start as double repechage. Step 8 should suggest a format from the athlete count.
- `npm test` covers the rules, weigh-in limits, registration warnings and migrations. Other checks from steps 1 to 6, including the browser workflows, were throwaway scripts and aren't in this repo.
- A waza-ari beats any number of yuko. This follows the point values (10 and 1), but no article found says so outright for 10 or more yuko.
- A locked draw blocks registration, weigh-in and category changes. An unlocked draw instead shows as out of date and must be redrawn.
- A category has at most two poules, as in FPJ Article 38. The prompt mentions more, which would need a new format.
- Poule tie-breaks follow FPJ Article 47. IJF also uses the fewest shidos, and counts the loser's scores. The trainer is to confirm.
- Wins by hansoku-make or withdrawal count as 100 points in a poule, which neither regulation states. A decision counts as 0.5, the FPJ's value for hantei. The trainer is to confirm.
- Changing a category's format removes its draw, because a draw only keeps clubs apart for the format it was made for.
- The hold timer runs on its own, and pausing the main clock doesn't pause it, so sono-mama isn't handled.
- After a correction changes a later contest's athletes, opening that contest sets its old result aside for good, even if another correction brings the same athletes back. The row stays in the database, with an empty `matchKey`.
- A migration that changes a table must also update `backupTables.ts` and add a step in `migrateBackup.ts`. `backupDatabase.test.ts` fails if a table or column is left out.
- `backupFiles.ts` (the Android file handling) has only been type-checked and reviewed, not run. Test export, import and restoring on the tablet.
- If a backup breaks a UNIQUE or foreign key rule, the import rolls back safely, but the message shows SQLite's own wording.
- `winnerNextMatchId` and `loserNextMatchId` are never filled in. If that changes, inserting a backup's matches needs deferred foreign keys.
- An unsporting hansoku-make (FPJ Article 45.2) can't be recorded, so that athlete can still be repechaged. Workaround: mark them as absent in their next match.
- Both athletes losing a quarterfinal or the last repechage should finish 7th, but places stop at 5th, so they get no place.
- Athlete history lists every match fought, including poule results that were later annulled.
- Separation is by club only. FPJ also separates by association, which the app doesn't store.
- A manual swap changes the draw, so its code alone no longer reproduces it.
- Declared weight isn't asked for at registration, because the real weight is recorded at the weigh-in.
- Random re-weighs with the 5% tolerance (FPJ Article 49) aren't supported. Only the main weigh-in is.
- FPJ Article 17 allows one weighing, but the app lets the trainer save again to correct a typing mistake.
- FPJ Article 18 restricts category changes in selection championships. The app doesn't enforce this, so the trainer must check it.
- `withdrawn` is an allowed status that nothing sets yet. The weigh-in screen could overwrite it, so guard this when something starts using it.
- `README.md` is still the Expo template's. It gets replaced in step 14.

## Decisions

| Decision | Why |
| --- | --- |
| Expo SDK 57 with NativeWind 4.2.7 | NativeWind's stable release documents SDK 57, not 58. Its v5 is a release candidate |
| Web kept for testing only | No tablet was available during development. A pass on web doesn't prove Android works |
| `PROMPT.md` overrides the global `CLAUDE.md` in this project | They disagree on styling and folders, for example NativeWind and `src/components` |
| Yuko enabled, with osaekomi at 5, 10 and 20 seconds | Current IJF refereeing rules include it, and FPJ Article 41 scores it. This corrects the prompt |
| Double repechage as the default format | FPJ Article 39: those who lost to the four semifinalists. This corrects the prompt |
| Golden score isn't a result type | It's when a match was won, not how. Stored as `isGoldenScore` |
| Benjamins is 10 or younger, and the 3 youngest classes use 2-minute matches and free grouping | Confirmed by the project owner. The regulation gives no times or weights for them |
| Asynchronous SQLite only | Synchronous reads crashed on web and print a performance warning |
| Text ids instead of numbers | Lets JSON backups merge between devices without clashes |
| Tournaments can be archived but not deleted | The prompt only asks for archive, and it removes a way to lose a whole tournament |
| Delete confirmations use a Modal, not `Alert` | `Alert` does nothing on web |
| Age or sex mismatches warn but don't block registration | FPJ Article 4 lets athletes compete outside their age class in some cases, so the trainer decides |
| No `eslint-disable` comments for hook rules, and no unused dependencies | React Compiler skips any function with such a comment and can remove an unused dependency. Doing both once made a reload silently stop working |
| Weights are compared in whole grams | Avoids decimal errors, and a limit is a decision about whether someone competes |
| Vibration only at the end of a match, no sound | React Native has a built-in API, so no extra package |

## Rule documents

The FPJ and IJF PDFs and their extracted text are in `docs/` on the owner's computer. They are in `.gitignore`, so a fresh clone won't have them. Sources:

- [FPJ regulations in force](https://www.fpj.pt/normativos/regulamentos-em-vigor/)
- [IJF documents](https://www.ijf.org/documents)

## FPJ data

The starting data is in `src/lib/constants/fpjCategories.ts`, from the FPJ "Regulamento de Organização de Provas 2026" (Articles 3, 14, 15, 17, 38 to 41 and 47). It was read as extracted PDF text. The FPJ's own 2021 refereeing regulation wasn't read, so `goldenScoreWonByShido: false` follows the IJF rules.
