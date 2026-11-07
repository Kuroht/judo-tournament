/**
 * =====================================================
 * FILE: backupFiles.web.ts
 * PURPOSE: The web version of backupFiles.ts, used only to
 *          test the app. A browser has no app folder, so it
 *          downloads files instead.
 * USED BY: useDataTools.ts
 * =====================================================
 */
import { getDocumentAsync } from 'expo-document-picker';

const LATEST_BACKUP_KEY = 'judo-latest-automatic-backup';
const LATEST_BACKUP_NAME_KEY = 'judo-latest-automatic-backup-name';

/** Downloads a file through the browser. */
export async function saveAndShareFile(fileName: string, text: string): Promise<void> {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Lets the user pick a file, and reads it.
 * @returns the file's text, or null if they cancelled
 */
export async function pickAndReadFile(): Promise<string | null> {
  const picked = await getDocumentAsync({ type: '*/*' });
  const asset = picked.assets?.[0];
  if (picked.canceled || asset === undefined) {
    return null;
  }

  return (await fetch(asset.uri)).text();
}

/** Keeps one copy in the browser's storage before anything is replaced. */
export async function saveAutomaticBackup(text: string): Promise<void> {
  localStorage.setItem(LATEST_BACKUP_KEY, text);
  localStorage.setItem(
    LATEST_BACKUP_NAME_KEY,
    `${new Date().toISOString().replace(/[:.]/g, '-')}.json`,
  );
}

/** Lists the name of the one automatic backup, if there is one. */
export async function listAutomaticBackupNames(): Promise<string[]> {
  const name = localStorage.getItem(LATEST_BACKUP_NAME_KEY);

  return name === null ? [] : [name];
}

/** Reads the automatic backup. Only one is kept here, so the name isn't needed. */
export async function readAutomaticBackup(_name: string): Promise<string> {
  return localStorage.getItem(LATEST_BACKUP_KEY) ?? '';
}
