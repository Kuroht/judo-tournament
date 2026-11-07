/**
 * =====================================================
 * FILE: SettingsRoot.tsx
 * PURPOSE: Waits for the saved settings, then starts the
 *          app in that language and saves later changes.
 * USED BY: src/app/_layout.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import type { ReactNode } from 'react';

import { FullScreenMessage } from '@/components/FullScreenMessage';
import type { Language } from '@/lib/i18n/LanguageContext';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';

import { saveLanguage } from '../db/settingsQueries';
import { useSavedSettings } from '../hooks/useSavedSettings';

type SettingsRootProps = {
  children: ReactNode;
};

export function SettingsRoot({ children }: SettingsRootProps) {
  const db = useSQLiteContext();
  const settings = useSavedSettings();

  function handleLanguageChange(language: Language) {
    // The new language already shows, so a failed save only loses it on next launch.
    saveLanguage(db, language).catch((error: unknown) => {
      console.error('Could not save the language', error);
    });
  }

  // Waiting here means the first screen is never shown in the wrong language.
  if (settings.type === 'loading') {
    return <FullScreenMessage title="A abrir os dados… / Opening data…" />;
  }

  return (
    <LanguageProvider initialLanguage={settings.language} onLanguageChange={handleLanguageChange}>
      {children}
    </LanguageProvider>
  );
}
