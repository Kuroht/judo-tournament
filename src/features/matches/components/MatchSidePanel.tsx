/**
 * =====================================================
 * FILE: MatchSidePanel.tsx
 * PURPOSE: One athlete's half of the match screen: their
 *          name, scores and scoring buttons. It keeps the
 *          judo colors in dark mode too.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { Text, View } from 'react-native';

import { useT } from '@/lib/i18n/useT';
import type { MatchEvent, RuleSet, Side, SideScore } from '@/lib/rules/types';

import type { ContestAthlete } from '../types';
import { MatchButton } from './MatchButton';
import { MatchScoreTiles } from './MatchScoreTiles';

type MatchSidePanelProps = {
  side: Side;
  athlete: ContestAthlete;
  score: SideScore;
  rules: RuleSet;
  isInProgress: boolean;
  isHoldRunning: boolean;
  isInRow: boolean;
  onEvent: (event: MatchEvent) => void;
  onStartHold: (side: Side) => void;
};

export function MatchSidePanel(props: MatchSidePanelProps) {
  const { side, athlete, score, rules, isInProgress, isHoldRunning, isInRow } = props;
  const { onEvent, onStartHold } = props;
  const t = useT();
  const isOnBlue = side === 'blue';
  const textClasses = isOnBlue ? 'text-white' : 'text-stone-900';

  return (
    <View
      // Only flex-1 in a row. In a scrolling column, Android collapses it to no height.
      className={`${isInRow ? 'flex-1' : ''} gap-3 rounded-2xl p-4 ${isOnBlue ? 'bg-judo-blue' : 'border-2 border-stone-300 bg-judo-white'}`}
    >
      <View className="gap-0.5">
        {/* The color's name is written too, so the side doesn't depend on color alone. */}
        <Text className={`text-base font-semibold ${textClasses}`}>
          {t(`matches.side.${side}`)}
        </Text>
        <Text className={`text-2xl font-bold ${textClasses}`}>{athlete.name}</Text>
        {athlete.clubName !== null && (
          <Text className={`text-base ${textClasses}`}>{athlete.clubName}</Text>
        )}
      </View>
      <MatchScoreTiles score={score} hasYuko={rules.isYukoEnabled} isOnBlue={isOnBlue} />
      <View className="flex-row flex-wrap gap-2">
        <MatchButton
          label={t('matches.ippon')}
          isOnBlue={isOnBlue}
          isDisabled={!isInProgress}
          onPress={() => onEvent({ type: 'score', side, score: 'ippon' })}
        />
        <MatchButton
          label={t('matches.wazaAri')}
          isOnBlue={isOnBlue}
          isDisabled={!isInProgress}
          onPress={() => onEvent({ type: 'score', side, score: 'wazaAri' })}
        />
        {rules.isYukoEnabled && (
          <MatchButton
            label={t('matches.yuko')}
            isOnBlue={isOnBlue}
            isDisabled={!isInProgress}
            onPress={() => onEvent({ type: 'score', side, score: 'yuko' })}
          />
        )}
        <MatchButton
          label={t('matches.osaekomi')}
          isOnBlue={isOnBlue}
          isDisabled={!isInProgress || isHoldRunning}
          onPress={() => onStartHold(side)}
        />
        <MatchButton
          label={`${t('matches.shido')} +`}
          isOnBlue={isOnBlue}
          isDisabled={!isInProgress}
          onPress={() => onEvent({ type: 'shido', side })}
        />
        <MatchButton
          label={`${t('matches.shido')} −`}
          isOnBlue={isOnBlue}
          isDisabled={!isInProgress || score.shidos === 0}
          onPress={() => onEvent({ type: 'shidoRemoved', side })}
        />
      </View>
    </View>
  );
}
