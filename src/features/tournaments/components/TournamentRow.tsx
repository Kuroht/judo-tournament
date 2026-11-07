/**
 * =====================================================
 * FILE: TournamentRow.tsx
 * PURPOSE: One tournament in the tournaments list.
 * USED BY: TournamentsScreen.tsx
 * =====================================================
 */
import { Pressable, Text } from 'react-native';

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
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-16 justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
    >
      <Text className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {tournament.name}
      </Text>
      <Text className="text-base text-slate-700 dark:text-slate-200">
        {parts.filter((part) => part !== null).join(' · ')}
      </Text>
    </Pressable>
  );
}
