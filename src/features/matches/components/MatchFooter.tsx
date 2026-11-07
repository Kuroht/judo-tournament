/**
 * =====================================================
 * FILE: MatchFooter.tsx
 * PURPOSE: The undo and "more actions" buttons under the
 *          side panels.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';
import type { MatchEvent } from '@/lib/rules/types';

import { MatchMoreActions } from './MatchMoreActions';

type MatchFooterProps = {
  canUndo: boolean;
  isInProgress: boolean;
  whiteName: string;
  blueName: string;
  onUndo: () => void;
  onEvent: (event: MatchEvent) => void;
};

export function MatchFooter(props: MatchFooterProps) {
  const { canUndo, isInProgress, whiteName, blueName, onUndo, onEvent } = props;
  const t = useT();
  const [isShowingMore, setIsShowingMore] = useState(false);

  return (
    <View className="flex-row gap-2">
      <View className="flex-1">
        <Button
          label={t('matches.undo')}
          icon="arrow-undo"
          variant="secondary"
          isDisabled={!canUndo}
          onPress={onUndo}
        />
      </View>
      <View className="flex-1">
        <Button
          label={t('matches.more')}
          icon="ellipsis-horizontal"
          variant="secondary"
          isDisabled={!isInProgress}
          onPress={() => setIsShowingMore(true)}
        />
      </View>
      <MatchMoreActions
        isVisible={isShowingMore}
        whiteName={whiteName}
        blueName={blueName}
        onEvent={onEvent}
        onClose={() => setIsShowingMore(false)}
      />
    </View>
  );
}
