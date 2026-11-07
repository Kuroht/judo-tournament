/**
 * =====================================================
 * FILE: CategoryFormScreen.tsx
 * PURPOSE: Adds a category by hand, or edits or deletes one.
 * USED BY: src/app/tournament/[id]/category/new.tsx,
 *          src/app/tournament/[id]/category/[categoryId].tsx
 * =====================================================
 */
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { Screen } from '@/components/Screen';
import { useGoBack } from '@/hooks/useGoBack';
import { useT } from '@/lib/i18n/useT';

import { useCategoryForm } from '../hooks/useCategoryForm';
import { CategoryFormFields } from './CategoryFormFields';

type CategoryFormScreenProps = {
  tournamentId: string;
  categoryId: string | null;
};

export function CategoryFormScreen({ tournamentId, categoryId }: CategoryFormScreenProps) {
  const t = useT();
  const goBack = useGoBack({ pathname: '/tournament/[id]/categories', params: { id: tournamentId } });
  const form = useCategoryForm(tournamentId, categoryId, goBack);
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
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="gap-4 pb-6">
        <CategoryFormFields values={form.values} errors={form.errors} onChange={form.setField} />
        {form.actionError !== null && (
          <Text className="text-lg font-semibold text-red-700 dark:text-red-300">
            {t(form.actionError.key, form.actionError.values)}
          </Text>
        )}
        <Button label={t('common.save')} onPress={() => void form.save()} isDisabled={form.isBusy} />
        {categoryId !== null && (
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
        title={t('categories.deleteTitle')}
        message={t('categories.deleteMessage', { name: form.values.label })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmingDelete(false)}
      />
    </Screen>
  );
}
