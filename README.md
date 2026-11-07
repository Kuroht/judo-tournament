# Judo Tournament

An app for running a Portuguese judo tournament on an Android tablet: clubs and athletes, weigh-in, draw, matches, results and medals. It works **completely offline**, and nothing leaves the tablet unless you export it.

> **Before relying on it:** your trainer still needs to validate the rules in [`docs/regras-para-validar.md`](docs/regras-para-validar.md), and `docs/project-status.md` lists the known limits.

## Running a tournament

Open a tournament, and work through its buttons from top to bottom:

1. **Categorias:** choose the categories and formats.
2. **Inscrições:** add athletes to categories.
3. **Pesagem:** record weights and no-shows.
4. **Sorteio:** draw each category, then **lock** it. Matches only exist once a draw is locked.
5. **Combates:** tap the big button to open the next match.
6. **Resultados:** see the places and medals, and print them or save them as a PDF.

**Correcting a mistake:** before confirming a match, use **Anular última ação**. After confirming, open the match and use **Corrigir o resultado**.

## Backing up your data

The data lives only on the tablet. **If the tablet is lost or the app is uninstalled, it's gone**, including the automatic copies.

- **After every tournament:** go to **Definições → Exportar e importar dados → Exportar tudo**, and save the file somewhere off the tablet, such as Drive or email.
- **To restore:** on the same screen, tap **Escolher um ficheiro**, check the preview, then choose:
  - **Juntar** only adds. What's already on the tablet stays as it is.
  - **Substituir tudo** swaps everything for the file's contents. A copy is saved first, which you can bring back with **Repor uma cópia automática**.
- **To move one tournament to another tablet:** use **Exportar: {tournament}**, then **Juntar** on the other tablet.

## Running it on your computer

You need [Node.js](https://nodejs.org) (LTS).

```bash
npm install
npx expo start
```

- **On the tablet:** install **Expo Go for SDK 57**, and scan the QR code. The Play Store's Expo Go may be for a newer SDK and refuse to open the app. If so, get the right version from [expo.dev/go](https://expo.dev/go).
- **In a browser, for quick tests:** press `w`. A browser can't test vibration, keep-awake, sharing or the Android print screen.

Expo Go needs your computer running, so **it can't be used at a real tournament**. For that, you need the installed build below.

## Installing it on the tablet

This builds an APK in Expo's cloud. It needs a free [Expo account](https://expo.dev), and an internet connection only while building.

```bash
npm install --global eas-cli
eas login
eas build --platform android --profile tablet
```

The first time, it asks for an Android package name, such as `com.yourname.judotournament`. Choose carefully: changing it later makes Android treat it as a different app, with separate data.

When it finishes, it gives you a link to the APK. Open it on the tablet and install it, allowing installs from that source if asked.

**To update:** raise `version` in `app.json`, build again and install over the old app. Your data stays, but export it first anyway.

**After installing, do a full test with airplane mode on,** because this is the first time the app runs without your computer.

## Checks for developers

```bash
npm test             # logic and database tests
npx tsc --noEmit     # types
npx eslint src       # code style
npx expo-doctor      # Expo setup
```

## How the code is organized

- `src/app/`: one thin file per screen, for Expo Router.
- `src/features/`: everything for one job, such as `matches` or `backup`. Features only use each other through their `index.ts`.
- `src/lib/rules/` and `src/lib/brackets/`: the judo rules and brackets, as pure functions with worked examples in their tests.
- `src/lib/db/`: the database and its migrations.
- `docs/`: `project-status.md` has decisions and known limits, and `regras-para-validar.md` is the rules document for the trainer.

**Changing the database:** add a new migration at the end of `migrations.ts`, and never edit an old one, because tablets have already run it. Then update `src/features/backup/backupTables.ts` and add a step in `migrateBackup.ts`. A test fails if you forget the table list.
