/**
 * =====================================================
 * FILE: LanguageProvider.tsx
 * PURPOSE: Holds the chosen language and gives it to every
 *          screen below it.
 * USED BY: SettingsRoot.tsx
 * =====================================================
 */
import { useState, type ReactNode } from 'react';

import { LanguageContext, type Language } from './LanguageContext';

type LanguageProviderProps = {
  initialLanguage: Language;
  onLanguageChange: (language: Language) => void;
  children: ReactNode;
};

// This file doesn't know about the database. Saving happens in onLanguageChange,
// so the shared lib/ code never has to depend on a feature.
export function LanguageProvider({
  initialLanguage,
  onLanguageChange,
  children,
}: LanguageProviderProps) {
  const [language, setCurrentLanguage] = useState(initialLanguage);

  function setLanguage(newLanguage: Language) {
    setCurrentLanguage(newLanguage);
    onLanguageChange(newLanguage);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
