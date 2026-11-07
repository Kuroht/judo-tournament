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
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { SearchField } from '@/components/SearchField';
import { TileGroups } from '@/components/TileGroups';
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
            router.replace({
              pathname: '/tournament/[id]/categories',
              params: { id: tournamentId },
            })
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
        <View className="flex-row">
          <SearchField label={t('common.search')} value={search} onChangeText={setSearch} />
        </View>
        <TileGroups
          tiles={visible.map((item) => ({
            id: item.categoryId,
            group: [item.ageClassName, t(`categories.sex.${item.sex}`)]
              .filter((part) => part !== null)
              .join(' · '),
            title: item.label,
            badge: t('registration.entryCount', { count: item.entryCount }),
            badgeTone: item.entryCount > 0 ? 'done' : 'neutral',
            onPress: () =>
              router.push({
                pathname: '/tournament/[id]/category-registration/[categoryId]/athletes',
                params: { id: tournamentId, categoryId: item.categoryId },
              }),
          }))}
          emptyComponent={<EmptyState message={t('common.noResults')} />}
        />
      </View>
    </Screen>
  );
}
