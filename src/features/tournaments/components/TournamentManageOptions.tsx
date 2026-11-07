/**
 * =====================================================
 * FILE: TournamentManageOptions.tsx
 * PURPOSE: The less common actions on a tournament. They
 *          stay folded away, so they don't compete with the
 *          next step.
 * USED BY: TournamentOverviewScreen.tsx
 * =====================================================
 */
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { useT } from '@/lib/i18n/useT';

type TournamentManageOptionsProps = {
  isArchived: boolean;
  isBusy: boolean;
  onEdit: () => void;
  onDuplicate: () => void;
  onSetArchived: (isArchived: boolean) => void;
};

export function TournamentManageOptions(props: TournamentManageOptionsProps) {
  const { isArchived, isBusy, onEdit, onDuplicate, onSetArchived } = props;
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="gap-2 pt-2">
      <Button
        label={t(isOpen ? 'tournaments.lessOptions' : 'tournaments.moreOptions')}
        icon={isOpen ? 'chevron-up' : 'chevron-down'}
        variant="secondary"
        onPress={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <>
          <Button
            label={t('tournaments.edit')}
            icon="create-outline"
            variant="secondary"
            onPress={onEdit}
          />
          <Button
            label={t('tournaments.duplicate')}
            icon="copy-outline"
            variant="secondary"
            isDisabled={isBusy}
            onPress={onDuplicate}
          />
          <Button
            label={t(isArchived ? 'tournaments.restore' : 'tournaments.archive')}
            icon="archive-outline"
            variant="secondary"
            isDisabled={isBusy}
            onPress={() => onSetArchived(!isArchived)}
          />
        </>
      )}
    </View>
  );
}
