/**
 * =====================================================
 * FILE: printDocument.ts
 * PURPOSE: Opens the system's print screen for a page, where
 *          it can be printed or saved as a PDF. On web,
 *          Metro uses printDocument.web.ts instead.
 * USED BY: usePrintResults.ts
 * =====================================================
 */
import { printAsync } from 'expo-print';

/** Opens the print screen. */
export async function printDocument(html: string): Promise<void> {
  await printAsync({ html });
}
