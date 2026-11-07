/**
 * =====================================================
 * FILE: LanguageSelector.tsx
 * PURPOSE: Lets the trainer switch between Portuguese and
 *          English.
 * USED BY: SettingsScreen.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { OptionButton } from '@/components/OptionButton';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { useT } from '@/lib/i18n/useT';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const t = useT();

  return (
    <View className="gap-2">
      <Text className="text-lg font-bold text-stone-900 dark:text-stone-100">
        {t('settings.language')}
      </Text>
      <View className="flex-row gap-2">
        {/* Language names stay in their own language, so anyone can find theirs. */}
        <OptionButton
          label="Português"
          isSelected={language === 'pt'}
          onPress={() => setLanguage('pt')}
        />
        <OptionButton
          label="English"
          isSelected={language === 'en'}
          onPress={() => setLanguage('en')}
        />
      </View>
    </View>
  );
}
