/**
 * =====================================================
 * FILE: NextMatchButton.tsx
 * PURPOSE: After a match, opens the next one in one tap, so
 *          a session runs as a loop: fight, confirm, next.
 * USED BY: FinishedMatch.tsx
 * =====================================================
 */
import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';

import { useTournamentMatches } from '../hooks/useTournamentMatches';
import { planUpcomingMatches } from '../matchList';

type NextMatchButtonProps = {
  tournamentId: string;
  // The match just finished, which is left out, and whose athletes need a rest.
  currentId: string;
  currentPair: readonly string[];
};

export function NextMatchButton({ tournamentId, currentId, currentPair }: NextMatchButtonProps) {
  const t = useT();
  const matches = useTournamentMatches(tournamentId);

  if (matches.type !== 'ready') {
    return null;
  }

  const [next] = planUpcomingMatches(matches.data.items, currentPair, 1, currentId);
  if (next === undefined) {
    return null;
  }

  return (
    <Button
      label={t('matches.nextMatch', {
        white: next.contest.white?.name ?? '',
        blue: next.contest.blue?.name ?? '',
      })}
      icon="play"
      onPress={() =>
        // Replaces this screen, so the back button returns to the list, not to old results.
        router.replace({
          pathname: '/tournament/[id]/category-matches/[categoryId]/match/[matchKey]',
          params: { id: tournamentId, categoryId: next.categoryId, matchKey: next.contest.key },
        })
      }
    />
  );
}
