/**
 * =====================================================
 * FILE: printDocument.web.ts
 * PURPOSE: The web version of printDocument.ts, used only
 *          to test the app. On web, expo-print prints the
 *          current screen, so the page goes in a hidden frame.
 * USED BY: usePrintResults.ts
 * =====================================================
 */

/** Opens the browser's print screen for the page. */
export async function printDocument(html: string): Promise<void> {
  const frame = document.createElement('iframe');
  frame.style.display = 'none';
  frame.setAttribute('data-print-frame', 'true');
  frame.srcdoc = html;
  frame.onload = () => frame.contentWindow?.print();
  document.body.appendChild(frame);
}
