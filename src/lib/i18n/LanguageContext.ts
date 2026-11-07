/**
 * =====================================================
 * FILE: LanguageContext.ts
 * PURPOSE: Shares the current language with the whole app.
 * USED BY: LanguageProvider.tsx, useLanguage.ts
 * =====================================================
 */
import { createContext } from 'react';

export type Language = 'pt' | 'en';

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

// null means "no provider above us". useLanguage turns that into a clear error.
export const LanguageContext = createContext<LanguageContextValue | null>(null);
