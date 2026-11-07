/**
 * =====================================================
 * FILE: matchesSearch.ts
 * PURPOSE: Text comparison that ignores accents and case.
 * USED BY: filterAthletes.ts, SelectField.tsx, clubQueries.ts
 * =====================================================
 */

/**
 * Removes accents, capitals and outer spaces so that text can be compared.
 * @param text any text
 * @returns the simplified text
 * @example
 * normalizeText(' João '); // "joao"
 */
export function normalizeText(text: string): string {
  // 1. NFD splits "ã" into "a" plus a separate accent mark.
  // 2. The range below is all of those accent marks, so removing it leaves "a".
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Checks if some text contains what the trainer typed.
 * @param text the text to look inside
 * @param search what was typed. Empty search matches everything.
 * @returns true if it matches
 * @example
 * matchesSearch('João Conceição', 'joao'); // true
 */
export function matchesSearch(text: string, search: string): boolean {
  return normalizeText(text).includes(normalizeText(search));
}
