/**
 * =====================================================
 * FILE: DrawScreen.tsx
 * PURPOSE: A tournament's categories, with the state of
 *          each one's draw.
 * USED BY: src/app/tournament/[id]/draw.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import type { TranslationKey } from '@/lib/i18n/pt';
import { useT } from '@/lib/i18n/useT';

import { useDrawSummaries } from '../hooks/useDrawSummaries';
import type { DrawSummary } from '../types';

const STATE_LABELS: Record<DrawSummary['drawState'], TranslationKey> = {
  none: 'draw.state.none',
  draft: 'draw.state.draft',
  locked: 'draw.state.locked',
};

type DrawScreenProps = {
  tournamentId: string;
};

export function DrawScreen({ tournamentId }: DrawScreenProps) {
  const summaries = useDrawSummaries(tournamentId);
  const router = useRouter();
  const t = useT();

  if (summaries.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (summaries.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={summaries.message} />;
  }

  return (
    <Screen>
      <FlatList
        data={summaries.data}
        keyExtractor={(summary) => summary.categoryId}
        contentContainerClassName="gap-2 flex-grow"
        ListEmptyComponent={<EmptyState message={t('registration.noCategories')} />}
        renderItem={({ item }) => {
          const parts = [
            item.ageClassName,
            t(`categories.sex.${item.sex}`),
            t('draw.athleteCount', { count: item.entryCount }),
            t(STATE_LABELS[item.drawState]),
          ];

          return (
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: '/tournament/[id]/category-draw/[categoryId]/details',
                  params: { id: tournamentId, categoryId: item.categoryId },
                })
              }
              className="min-h-16 justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
            >
              <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {item.label}
              </Text>
              <Text className="text-base text-slate-700 dark:text-slate-200">
                {parts.filter((part) => part !== null).join(' · ')}
              </Text>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
