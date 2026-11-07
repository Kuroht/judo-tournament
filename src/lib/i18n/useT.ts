/**
 * =====================================================
 * FILE: useT.ts
 * PURPOSE: The translation hook used by every screen.
 * USED BY: any component that shows text
 * =====================================================
 */
import { en } from './en';
import type { Language } from './LanguageContext';
import { pt, type TranslationKey } from './pt';
import { useLanguage } from './useLanguage';

const TRANSLATIONS: Record<Language, Record<TranslationKey, string>> = { pt, en };

/**
 * Gives a function that turns a key into text in the current language.
 * @returns the translate function. Values in the optional second argument
 *          replace matching {placeholders} in the text.
 * @example
 * const t = useT();
 * t('tabs.athletes'); // "Atletas" in Portuguese, "Athletes" in English
 * t('athletes.deleteMessage', { name: 'Ana' }); // text with {name} replaced
 */
export function useT() {
  const { language } = useLanguage();

  return (key: TranslationKey, values: Record<string, string | number> = {}): string => {
    let text = TRANSLATIONS[language][key];

    for (const [name, value] of Object.entries(values)) {
      // A function, because in a plain string characters like $& have a special
      // meaning, and a name containing them would corrupt the message.
      text = text.replaceAll(`{${name}}`, () => String(value));
    }

    return text;
  };
}
