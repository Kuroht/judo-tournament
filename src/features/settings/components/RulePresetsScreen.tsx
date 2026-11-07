/**
 * =====================================================
 * FILE: RulePresetsScreen.tsx
 * PURPOSE: Lists the age classes and the rules of each one.
 * USED BY: src/app/rule-presets.tsx
 * =====================================================
 */
import { router } from 'expo-router';
import { FlatList, Pressable, Text } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useFocusQuery } from '@/hooks/useFocusQuery';
import { useT } from '@/lib/i18n/useT';

import { listRulePresets } from '../db/rulePresetQueries';

export function RulePresetsScreen() {
  const t = useT();
  const presets = useFocusQuery(listRulePresets);

  if (presets.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (presets.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={presets.message} />;
  }

  return (
    <Screen>
      <FlatList
        data={presets.data}
        keyExtractor={(preset) => preset.id}
        contentContainerClassName="gap-2 flex-grow"
        ListEmptyComponent={<EmptyState message={t('settings.noRulePresets')} />}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/rule-preset/[id]', params: { id: item.id } })}
            className="min-h-16 justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
          >
            <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {item.name}
            </Text>
            <Text className="text-base text-slate-700 dark:text-slate-200">
              {t('settings.rulePresetSummary', {
                seconds: item.matchSeconds,
                yuko: t(item.isYukoEnabled ? 'settings.yes' : 'settings.no'),
                golden: t(item.hasGoldenScore ? 'settings.yes' : 'settings.no'),
                grams: item.weightToleranceGrams,
              })}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
