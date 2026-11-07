/**
 * =====================================================
 * FILE: DrawScreen.tsx
 * PURPOSE: A tournament's categories, with the state of
 *          each one's draw.
 * USED BY: src/app/tournament/[id]/draw.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import type { BadgeTone } from '@/components/StatusBadge';
import { TileGroups } from '@/components/TileGroups';
import type { TranslationKey } from '@/lib/i18n/pt';
import { useT } from '@/lib/i18n/useT';

import { useDrawSummaries } from '../hooks/useDrawSummaries';
import type { DrawSummary } from '../types';

const STATE_LABELS: Record<DrawSummary['drawState'], TranslationKey> = {
  none: 'draw.state.none',
  draft: 'draw.state.draft',
  locked: 'draw.state.locked',
};

const STATE_TONES: Record<DrawSummary['drawState'], BadgeTone> = {
  none: 'neutral',
  draft: 'warning',
  locked: 'done',
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
      <TileGroups
        tiles={summaries.data.map((item) => ({
          id: item.categoryId,
          group: [item.ageClassName, t(`categories.sex.${item.sex}`)]
            .filter((part) => part !== null)
            .join(' · '),
          title: item.label,
          detail: t('draw.athleteCount', { count: item.entryCount }),
          badge: t(STATE_LABELS[item.drawState]),
          badgeTone: STATE_TONES[item.drawState],
          onPress: () =>
            router.push({
              pathname: '/tournament/[id]/category-draw/[categoryId]/details',
              params: { id: tournamentId, categoryId: item.categoryId },
            }),
        }))}
        emptyComponent={<EmptyState message={t('registration.noCategories')} />}
      />
    </Screen>
  );
}
