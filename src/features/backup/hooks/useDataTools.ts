/**
 * =====================================================
 * FILE: useDataTools.ts
 * PURPOSE: Runs export and import, from picking a file to
 *          saving its contents.
 * USED BY: DataToolsScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { useReloadableFocusQuery } from '@/hooks/useReloadableFocusQuery';
import type { TranslationKey } from '@/lib/i18n/pt';

import { getFullBackupName, getTournamentBackupName } from '../backupFileNames';
import {
  listAutomaticBackupNames,
  pickAndReadFile,
  readAutomaticBackup,
  saveAndShareFile,
  saveAutomaticBackup,
} from '../backupFiles';
import { BACKUP_APP_NAME, type Backup, type BackupData } from '../backupTables';
import {
  addRows,
  getDatabaseVersion,
  listTournamentChoices,
  readAllRows,
  replaceAllRows,
  type TournamentChoice,
} from '../db/backupQueries';
import { mergeBackup, type MergePlan } from '../mergeBackup';
import { pickTournament } from '../pickTournament';
import { validateBackup } from '../validateBackup';

export type DataToolsMessage = {
  isError: boolean;
  key: TranslationKey;
  values?: Record<string, string | number>;
};

export type ImportPreview = {
  backup: Backup;
  mergePlan: MergePlan;
  // What is on this tablet now, to say what replacing would delete.
  current: BackupData;
};

/** Gives the data tools screen its tournaments, and its actions. */
export function useDataTools() {
  const db = useSQLiteContext();
  const { state: tournaments, reload } = useReloadableFocusQuery(listTournamentChoices);
  const [message, setMessage] = useState<DataToolsMessage | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [automaticBackups, setAutomaticBackups] = useState<string[] | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const buildBackupText = useCallback(
    async (scope: Backup['scope'], data: BackupData) => {
      const backup: Backup = {
        app: BACKUP_APP_NAME,
        schemaVersion: await getDatabaseVersion(db),
        exportedAt: new Date().toISOString(),
        scope,
        data,
      };

      return JSON.stringify(backup);
    },
    [db],
  );

  async function run(action: () => Promise<void>, failureKey: TranslationKey) {
    setIsBusy(true);
    setMessage(null);
    try {
      await action();
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);
      setMessage({ isError: true, key: failureKey, values: { details } });
    } finally {
      setIsBusy(false);
    }
  }

  function exportAll() {
    return run(async () => {
      const text = await buildBackupText('all', await readAllRows(db));
      await saveAndShareFile(getFullBackupName(new Date()), text);
    }, 'backup.exportFailed');
  }

  function exportTournament(tournament: TournamentChoice) {
    return run(async () => {
      const data = pickTournament(await readAllRows(db), tournament.id);
      const text = await buildBackupText('tournament', data);
      await saveAndShareFile(getTournamentBackupName(tournament.name, new Date()), text);
    }, 'backup.exportFailed');
  }

  /** Checks a file's text and shows its preview. Nothing is saved yet. */
  async function showPreview(text: string) {
    const check = validateBackup(text, await getDatabaseVersion(db));
    if (check.type === 'invalid') {
      setMessage({
        isError: true,
        key: `backup.problem.${check.problem}`,
        values: { details: check.details ?? '' },
      });
      return;
    }

    const current = await readAllRows(db);
    setAutomaticBackups(null);
    setPreview({
      backup: check.backup,
      mergePlan: mergeBackup(current, check.backup.data),
      current,
    });
  }

  function pickFile() {
    return run(async () => {
      const text = await pickAndReadFile();
      if (text !== null) {
        await showPreview(text);
      }
    }, 'backup.readFailed');
  }

  /** Lists the automatic backups. Each Replace makes a new one, so the trainer has to choose. */
  function showAutomaticBackups() {
    return run(async () => {
      const names = await listAutomaticBackupNames();
      if (names.length === 0) {
        setMessage({ isError: true, key: 'backup.noAutomaticBackup' });
        return;
      }
      setAutomaticBackups(names);
    }, 'backup.readFailed');
  }

  function chooseAutomaticBackup(name: string) {
    return run(async () => {
      await showPreview(await readAutomaticBackup(name));
    }, 'backup.readFailed');
  }

  function applyMerge() {
    if (preview === null) {
      return Promise.resolve();
    }

    const { backup } = preview;
    return run(async () => {
      // Worked out again, in case the data has changed since the preview.
      const { toAdd } = mergeBackup(await readAllRows(db), backup.data);
      await addRows(db, toAdd);
      setPreview(null);
      setMessage({ isError: false, key: 'backup.mergeDone' });
      await reload();
    }, 'backup.importFailed');
  }

  function applyReplace() {
    if (preview === null) {
      return Promise.resolve();
    }

    const { backup } = preview;
    return run(async () => {
      // First, so that nothing is replaced unless a copy of it exists.
      await saveAutomaticBackup(await buildBackupText('all', await readAllRows(db)));
      await replaceAllRows(db, backup.data);
      setPreview(null);
      setMessage({ isError: false, key: 'backup.replaceDone' });
      await reload();
    }, 'backup.importFailed');
  }

  return {
    tournaments,
    message,
    preview,
    isBusy,
    exportAll,
    exportTournament,
    pickFile,
    automaticBackups,
    showAutomaticBackups,
    chooseAutomaticBackup,
    applyMerge,
    applyReplace,
    cancelPreview: () => setPreview(null),
  };
}
