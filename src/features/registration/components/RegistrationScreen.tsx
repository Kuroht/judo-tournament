/**
 * =====================================================
 * FILE: RegistrationScreen.tsx
 * PURPOSE: A tournament's categories, with how many athletes
 *          are registered in each.
 * USED BY: src/app/tournament/[id]/registration.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useT } from '@/lib/i18n/useT';
import { matchesSearch } from '@/lib/text/matchesSearch';

import { useRegistrationSummaries } from '../hooks/useRegistrationSummaries';

type RegistrationScreenProps = {
  tournamentId: string;
};

export function RegistrationScreen({ tournamentId }: RegistrationScreenProps) {
  const summaries = useRegistrationSummaries(tournamentId);
  const router = useRouter();
  const t = useT();
  const [search, setSearch] = useState('');

  if (summaries.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (summaries.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={summaries.message} />;
  }

  if (summaries.data.length === 0) {
    return (
      <Screen>
        <EmptyState
          message={t('registration.noCategories')}
          actionLabel={t('registration.goToCategories')}
          onAction={() =>
            router.replace({ pathname: '/tournament/[id]/categories', params: { id: tournamentId } })
          }
        />
      </Screen>
    );
  }

  // Calculated on each render rather than stored, so it can never be out of date.
  const visible = summaries.data.filter(
    (summary) =>
      matchesSearch(summary.label, search) || matchesSearch(summary.ageClassName ?? '', search),
  );

  return (
    <Screen>
      <View className="flex-1 gap-3">
        <TextField label={t('common.search')} value={search} onChangeText={setSearch} />
        <FlatList
          className="flex-1"
          data={visible}
          keyExtractor={(summary) => summary.categoryId}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-2"
          ListEmptyComponent={<EmptyState message={t('common.noResults')} />}
          renderItem={({ item }) => {
            const sex = t(`categories.sex.${item.sex}`);
            const parts = [item.ageClassName, sex].filter((part) => part !== null);

            return (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/tournament/[id]/category-registration/[categoryId]/athletes',
                    params: { id: tournamentId, categoryId: item.categoryId },
                  })
                }
                className="min-h-16 justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
              >
                <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {item.label}
                </Text>
                <Text className="text-base text-slate-700 dark:text-slate-200">
                  {`${parts.join(' · ')} · ${t('registration.entryCount', { count: item.entryCount })}`}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>
    </Screen>
  );
}
