/**
 * =====================================================
 * FILE: useLanguage.ts
 * PURPOSE: Reads and changes the current language.
 * USED BY: useT.ts, LanguageSelector.tsx
 * =====================================================
 */
import { useContext } from 'react';

import { LanguageContext, type LanguageContextValue } from './LanguageContext';

/**
 * Gives access to the current language.
 * @returns the current language and a function to change it
 * @throws if used outside of LanguageProvider, which is always a coding mistake
 */
export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (context === null) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
