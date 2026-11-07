/**
 * =====================================================
 * FILE: MatchScreen.tsx
 * PURPOSE: Loads one match, then shows it live or finished.
 * USED BY: src/app/tournament/[id]/category-matches/
 *          [categoryId]/match/[matchKey].tsx
 * =====================================================
 */
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { useT } from '@/lib/i18n/useT';

import { useMatchData } from '../hooks/useMatchData';
import { FinishedMatch } from './FinishedMatch';
import { LiveMatch } from './LiveMatch';

type MatchScreenProps = {
  categoryId: string;
  matchKey: string;
};

export function MatchScreen({ categoryId, matchKey }: MatchScreenProps) {
  const t = useT();
  const { state, reload } = useMatchData(categoryId, matchKey);

  if (state.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (state.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={state.message} />;
  }

  if (state.data === null) {
    return <FullScreenMessage title={t('common.notFound')} />;
  }

  if (state.data.row.status === 'finished') {
    return <FinishedMatch data={state.data} reload={reload} />;
  }

  return <LiveMatch data={state.data} reload={reload} />;
}
