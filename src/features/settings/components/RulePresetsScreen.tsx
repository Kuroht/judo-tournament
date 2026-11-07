/**
 * =====================================================
 * FILE: RulePresetsScreen.tsx
 * PURPOSE: Lists the age classes and the rules of each one.
 * USED BY: src/app/rule-presets.tsx
 * =====================================================
 */
import { router } from 'expo-router';
import { FlatList } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { ListRow } from '@/components/ListRow';
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
          <ListRow
            title={item.name}
            subtitle={t('settings.rulePresetSummary', {
              seconds: item.matchSeconds,
              yuko: t(item.isYukoEnabled ? 'settings.yes' : 'settings.no'),
              golden: t(item.hasGoldenScore ? 'settings.yes' : 'settings.no'),
              grams: item.weightToleranceGrams,
            })}
            onPress={() => router.push({ pathname: '/rule-preset/[id]', params: { id: item.id } })}
          />
        )}
      />
    </Screen>
  );
}
