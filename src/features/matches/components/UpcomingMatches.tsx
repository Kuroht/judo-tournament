/**
 * =====================================================
 * FILE: UpcomingMatches.tsx
 * PURPOSE: The next few matches, shown during a match so the
 *          trainer can call the next athletes without leaving
 *          the scoreboard.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { SectionTitle } from '@/components/SectionTitle';
import { useT } from '@/lib/i18n/useT';

import { useTournamentMatches } from '../hooks/useTournamentMatches';
import { planUpcomingMatches } from '../matchList';

// Enough to call the next athletes to the mat, without crowding the scoreboard.
const UPCOMING_COUNT = 3;

type UpcomingMatchesProps = {
  tournamentId: string;
  // The match being fought now, which is left out.
  currentId: string;
  currentPair: readonly string[];
};

export function UpcomingMatches({ tournamentId, currentId, currentPair }: UpcomingMatchesProps) {
  const t = useT();
  const matches = useTournamentMatches(tournamentId);

  // This list only helps, so while it loads or if it fails, the scoreboard simply goes without it.
  if (matches.type !== 'ready') {
    return null;
  }

  const upcoming = planUpcomingMatches(matches.data.items, currentPair, UPCOMING_COUNT, currentId);
  if (upcoming.length === 0) {
    return null;
  }

  return (
    <View className="gap-1">
      <SectionTitle title={t('matches.upNext')} />
      {upcoming.map((item, index) => (
        <Text key={item.id} className="text-base text-stone-700 dark:text-stone-200">
          {`${index + 1}. ${item.category.title}: ${item.contest.white?.name ?? '—'} x ${item.contest.blue?.name ?? '—'}`}
        </Text>
      ))}
    </View>
  );
}
