/**
 * =====================================================
 * FILE: TournamentStepButtons.tsx
 * PURPOSE: The buttons for each stage of running a
 *          tournament, in the order they happen.
 * USED BY: TournamentOverviewScreen.tsx
 * =====================================================
 */
import { useRouter } from 'expo-router';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';

import type { Tournament } from '../types';

type TournamentStepButtonsProps = {
  tournament: Tournament;
};

export function TournamentStepButtons({ tournament }: TournamentStepButtonsProps) {
  const t = useT();
  const router = useRouter();
  const params = { id: tournament.id };

  return (
    <>
      <Button
        label={t('tournaments.openCategories', { count: tournament.categoryCount })}
        onPress={() => router.push({ pathname: '/tournament/[id]/categories', params })}
      />
      <Button
        label={t('tournaments.openRegistration', { count: tournament.entryCount })}
        onPress={() => router.push({ pathname: '/tournament/[id]/registration', params })}
      />
      <Button
        label={t('tournaments.openWeighIn', {
          done: tournament.weighInDoneCount,
          total: tournament.entryCount,
        })}
        onPress={() => router.push({ pathname: '/tournament/[id]/weigh-in', params })}
      />
    </>
  );
}
