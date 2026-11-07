/**
 * =====================================================
 * FILE: ClubFormScreen.tsx
 * PURPOSE: Adds a new club, or edits or deletes one.
 * USED BY: src/app/club/new.tsx, src/app/club/[id].tsx
 * =====================================================
 */
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useGoBack } from '@/hooks/useGoBack';
import { useT } from '@/lib/i18n/useT';

import { useClubForm } from '../hooks/useClubForm';

type ClubFormScreenProps = {
  clubId: string | null;
};

export function ClubFormScreen({ clubId }: ClubFormScreenProps) {
  const t = useT();
  const goBack = useGoBack('/clubs');
  const form = useClubForm(clubId, goBack);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (form.status === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (form.status === 'notFound' || form.status === 'loadError') {
    const key = form.status === 'notFound' ? 'common.notFound' : 'common.loadError';
    return <FullScreenMessage title={t(key)} />;
  }

  function handleConfirmDelete() {
    setIsConfirmingDelete(false);
    void form.remove();
  }

  return (
    <Screen>
      {/* "handled" lets the first tap press a button instead of only closing the keyboard. */}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4">
        <TextField
          label={t('clubs.name')}
          value={form.name}
          onChangeText={form.setName}
          error={form.nameError === null ? undefined : t(form.nameError)}
          autoCapitalize="words"
          maxLength={100}
        />
        {form.actionError !== null && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
            {t(form.actionError.key, form.actionError.values)}
          </Text>
        )}
        <Button label={t('common.save')} onPress={() => void form.save()} isDisabled={form.isBusy} />
        {clubId !== null && (
          <Button
            label={t('common.delete')}
            variant="danger"
            onPress={() => setIsConfirmingDelete(true)}
            isDisabled={form.isBusy}
          />
        )}
      </ScrollView>
      <ConfirmDialog
        isVisible={isConfirmingDelete}
        title={t('clubs.deleteTitle')}
        message={t('clubs.deleteMessage', { name: form.name })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </Screen>
  );
}
