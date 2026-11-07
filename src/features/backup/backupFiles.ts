/**
 * =====================================================
 * FILE: backupFiles.ts
 * PURPOSE: Reads and writes backup files on Android and
 *          iOS. backupFiles.web.ts does the same on web,
 *          and Metro picks the right file by itself.
 * USED BY: useDataTools.ts
 * =====================================================
 */
import { getDocumentAsync } from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

const AUTOMATIC_BACKUP_FOLDER = 'automatic-backups';
const AUTOMATIC_BACKUPS_TO_KEEP = 5;

/** Writes a file to the cache, then lets the trainer send or save it. */
export async function saveAndShareFile(fileName: string, text: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(text);

  await shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: fileName });
}

/**
 * Lets the trainer pick a file, and reads it.
 * @returns the file's text, or null if they cancelled
 */
export async function pickAndReadFile(): Promise<string | null> {
  // Any type, because some apps and phones don't label JSON files as JSON.
  const picked = await getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  const asset = picked.assets?.[0];

  return picked.canceled || asset === undefined ? null : new File(asset.uri).text();
}

function automaticBackupFolder(): Directory {
  return new Directory(Paths.document, AUTOMATIC_BACKUP_FOLDER);
}

/** Lists the automatic backups, oldest first. Their names start with the date and time. */
function listAutomaticBackups(): File[] {
  const folder = automaticBackupFolder();
  if (!folder.exists) {
    return [];
  }

  return folder
    .list()
    .filter((item): item is File => item instanceof File)
    .sort((first, second) => first.name.localeCompare(second.name));
}

/**
 * Saves a copy inside the app before anything is replaced. Only the newest few are kept,
 * and never at the cost of this one, even if the tablet's clock has been set back.
 * @throws if it can't be saved, so that the replace doesn't go ahead without a copy
 */
export async function saveAutomaticBackup(text: string): Promise<void> {
  const folder = automaticBackupFolder();
  if (!folder.exists) {
    folder.create({ intermediates: true });
  }

  // Colons aren't allowed in Android file names.
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = new File(folder, `${stamp}.json`);
  file.create();
  file.write(text);

  const others = listAutomaticBackups().filter((backup) => backup.name !== file.name);
  const extraCount = others.length - (AUTOMATIC_BACKUPS_TO_KEEP - 1);
  for (const old of others.slice(0, Math.max(0, extraCount))) {
    old.delete();
  }
}

/** Lists the names of the automatic backups, newest first. */
export async function listAutomaticBackupNames(): Promise<string[]> {
  return listAutomaticBackups()
    .map((backup) => backup.name)
    .reverse();
}

/** Reads one automatic backup, chosen from listAutomaticBackupNames. */
export async function readAutomaticBackup(name: string): Promise<string> {
  return new File(automaticBackupFolder(), name).text();
}
