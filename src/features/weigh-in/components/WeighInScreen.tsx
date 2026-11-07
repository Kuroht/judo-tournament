/**
 * =====================================================
 * FILE: WeighInScreen.tsx
 * PURPOSE: Loads a tournament's weigh-in, then shows it.
 * USED BY: src/app/tournament/[id]/weigh-in.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useT } from '@/lib/i18n/useT';

import { useWeighIn } from '../hooks/useWeighIn';
import { WeighInContent } from './WeighInContent';

type WeighInScreenProps = {
  tournamentId: string;
};

export function WeighInScreen({ tournamentId }: WeighInScreenProps) {
  const t = useT();
  const router = useRouter();
  const weighIn = useWeighIn(tournamentId);
  const { state } = weighIn;

  if (state.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (state.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={state.message} />;
  }

  if (state.data.entries.length === 0) {
    return (
      <Screen>
        <EmptyState
          message={t('weighIn.empty')}
          actionLabel={t('weighIn.goToRegistration')}
          onAction={() =>
            router.replace({
              pathname: '/tournament/[id]/registration',
              params: { id: tournamentId },
            })
          }
        />
      </Screen>
    );
  }

  return <WeighInContent data={state.data} weighIn={weighIn} />;
}
