/**
 * =====================================================
 * FILE: TournamentRow.tsx
 * PURPOSE: One tournament in the list.
 * USED BY: TournamentsScreen.tsx
 * =====================================================
 */
import { ListRow } from '@/components/ListRow';
import { useT } from '@/lib/i18n/useT';

import { formatDisplayDate } from '../tournamentDate';
import type { Tournament } from '../types';

type TournamentRowProps = {
  tournament: Tournament;
  onPress: () => void;
};

export function TournamentRow({ tournament, onPress }: TournamentRowProps) {
  const t = useT();
  const parts = [
    formatDisplayDate(tournament.date),
    tournament.place,
    t('tournaments.categoryCount', { count: tournament.categoryCount }),
  ];

  return (
    <ListRow
      title={tournament.name}
      subtitle={parts.filter((part) => part !== null).join(' · ')}
      icon="trophy-outline"
      onPress={onPress}
    />
  );
}
