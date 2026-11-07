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
| 6 | Weigh-in | Next |
| 7 to 14 | Rules through final polish | Not started |

## Known issues

### Critical: never run on Android

Every step so far has only been tested on web. The Android bundle builds, but the app has never run on a tablet or emulator. **Do not rely on it at a tournament until this is done.**

Check these first, because they can't be tested on web or were only checked by reading the code:

- SQLite on Android, which uses different code from the browser version.
- The on-screen keyboard: the search box in the option picker, and reaching fields on the form screens.
- Long club names wrapping in the option picker.
- **Try again** on the error screen, which retries in place on Android and reloads the page on web.
- Accented text search and sorting (`normalize` and `localeCompare`).
- Working in airplane mode from an installed build. A development build still needs the computer.

### Expo Go may refuse the project

The project uses SDK 57, and Expo Go usually targets the newest SDK. If it reports an incompatible version, use a development build. This hasn't been tested.

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
- `npm run lint` isn't set up, because ESLint hasn't been approved.
- Tests so far were throwaway scripts and aren't in this repo. Bring the important ones into `jest-expo` at step 7.
- Removing a registration isn't blocked once a draw exists, because draws don't exist yet. Step 8 must add this, and must also handle athletes added after a draw.
- Declared weight isn't asked for at registration, because the real weight is recorded at the weigh-in.
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
| Vibration only at the end of a match, no sound | React Native has a built-in API, so no extra package |

## FPJ data

The starting data is in `src/lib/constants/fpjCategories.ts`, from the FPJ "Regulamento de Organização de Provas 2026" (Articles 3, 14, 15, 17, 38 to 41 and 47). It was read as extracted PDF text. The FPJ's own 2021 refereeing regulation wasn't read, so `goldenScoreWonByShido: false` follows the IJF rules.
