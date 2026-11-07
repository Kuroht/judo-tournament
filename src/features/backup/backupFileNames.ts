/**
 * =====================================================
 * FILE: backupFileNames.ts
 * PURPOSE: Names backup files, with the date in the name.
 * USED BY: useDataTools.ts
 * =====================================================
 */

/**
 * Names a backup of everything.
 * @example
 * getFullBackupName(new Date('2026-11-07')); // "judo-tudo-2026-11-07.json"
 */
export function getFullBackupName(date: Date): string {
  return `judo-tudo-${date.toISOString().slice(0, 10)}.json`;
}

/**
 * Turns an automatic backup's file name back into a date and time to show.
 * @param name a name such as "2026-11-07T10-30-05-123Z.json"
 * @returns the date and local time, such as "2026-11-07 10:30", or the name if it's unusual
 */
export function describeAutomaticBackup(name: string): string {
  const match = /^(\d{4}-\d\d-\d\d)T(\d\d)-(\d\d)-(\d\d)-(\d{3})Z/.exec(name);
  if (match === null) {
    return name;
  }

  const [, day, hours, minutes, seconds, milliseconds] = match;
  const date = new Date(`${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`);
  const twoDigits = (value: number) => String(value).padStart(2, '0');
  const localDay = `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;

  return `${localDay} ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`;
}

/**
 * Names a backup of one tournament. Accents and symbols are removed, because some
 * phones and email services handle them badly in file names.
 * @example
 * getTournamentBackupName('Taça de Lisboa', new Date('2026-11-07'));
 * // "judo-taca-de-lisboa-2026-11-07.json"
 */
export function getTournamentBackupName(tournamentName: string, date: Date): string {
  const slug = tournamentName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `judo-${slug || 'torneio'}-${date.toISOString().slice(0, 10)}.json`;
}
