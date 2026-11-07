/**
 * =====================================================
 * FILE: MatchMoreActions.tsx
 * PURPOSE: The less common actions, kept off the main screen
 *          so it stays easy to use. This is also how a
 *          trainer who ignores the clock enters a result.
 * USED BY: LiveMatch.tsx
 * =====================================================
 */
import { Modal, ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';
import type { MatchEvent } from '@/lib/rules/types';

type MatchMoreActionsProps = {
  isVisible: boolean;
  whiteName: string;
  blueName: string;
  onEvent: (event: MatchEvent) => void;
  onClose: () => void;
};

export function MatchMoreActions(props: MatchMoreActionsProps) {
  const { isVisible, whiteName, blueName, onEvent, onClose } = props;
  const t = useT();

  const actions: { label: string; event: MatchEvent }[] = [
    { label: t('matches.timeUp'), event: { type: 'timeUp' } },
    { label: t('matches.shidoBoth'), event: { type: 'shidoBoth' } },
    {
      label: t('matches.decideFor', { name: whiteName }),
      event: { type: 'decision', winner: 'white' },
    },
    {
      label: t('matches.decideFor', { name: blueName }),
      event: { type: 'decision', winner: 'blue' },
    },
    {
      label: t('matches.hansokuMakeFor', { name: whiteName }),
      event: { type: 'hansokuMake', side: 'white' },
    },
    {
      label: t('matches.hansokuMakeFor', { name: blueName }),
      event: { type: 'hansokuMake', side: 'blue' },
    },
    { label: t('matches.hansokuMakeBoth'), event: { type: 'hansokuMakeBoth' } },
    {
      label: t('matches.withdrewFor', { name: whiteName }),
      event: { type: 'kikenGachi', withdrawnSide: 'white' },
    },
    {
      label: t('matches.withdrewFor', { name: blueName }),
      event: { type: 'kikenGachi', withdrawnSide: 'blue' },
    },
    {
      label: t('matches.absentFor', { name: whiteName }),
      event: { type: 'fusenGachi', absentSide: 'white' },
    },
    {
      label: t('matches.absentFor', { name: blueName }),
      event: { type: 'fusenGachi', absentSide: 'blue' },
    },
  ];

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60 p-4">
        <View className="max-h-full w-full max-w-lg gap-3 rounded-xl bg-white p-4 dark:bg-slate-800">
          <ScrollView contentContainerClassName="gap-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                variant="secondary"
                onPress={() => {
                  onClose();
                  onEvent(action.event);
                }}
              />
            ))}
          </ScrollView>
          <Button label={t('common.close')} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
