/**
 * =====================================================
 * FILE: MatchScoreTiles.tsx
 * PURPOSE: One athlete's scores as big numbers, like a
 *          scoreboard, readable at arm's length.
 * USED BY: MatchSidePanel.tsx, FinishedMatch.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { useT } from '@/lib/i18n/useT';
import type { SideScore } from '@/lib/rules/types';

type MatchScoreTilesProps = {
  score: SideScore;
  hasYuko: boolean;
  isOnBlue: boolean;
};

export function MatchScoreTiles({ score, hasYuko, isOnBlue }: MatchScoreTilesProps) {
  const t = useT();
  const tiles = [
    { label: t('matches.ippon'), value: score.ippons },
    { label: t('matches.wazaAri'), value: score.wazaAris },
    ...(hasYuko ? [{ label: t('matches.yuko'), value: score.yukos }] : []),
    { label: t('matches.shido'), value: score.shidos },
  ];
  const tileClass = isOnBlue ? 'bg-blue-800' : 'bg-stone-200';
  const textClass = isOnBlue ? 'text-white' : 'text-stone-900';

  return (
    <View className="flex-row flex-wrap gap-2">
      {tiles.map(({ label, value }) => (
        <View
          key={label}
          accessible
          accessibilityLabel={`${label}: ${value}`}
          className={`min-w-16 flex-1 items-center rounded-lg px-1 py-2 ${tileClass}`}
        >
          <Text className={`text-sm font-semibold ${textClass}`}>{label}</Text>
          <Text className={`text-4xl font-bold ${textClass}`}>{value}</Text>
        </View>
      ))}
    </View>
  );
}
