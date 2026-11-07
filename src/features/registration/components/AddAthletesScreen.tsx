/**
 * =====================================================
 * FILE: AddAthletesScreen.tsx
 * PURPOSE: Loads a category, then shows the list for adding
 *          athletes to it.
 * USED BY: src/app/tournament/[id]/category-registration/
 *          [categoryId]/add.tsx
 * =====================================================
 */
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { useT } from '@/lib/i18n/useT';

import { useCategoryRegistration } from '../hooks/useCategoryRegistration';
import { AddAthletesContent } from './AddAthletesContent';

type AddAthletesScreenProps = {
  categoryId: string;
};

export function AddAthletesScreen({ categoryId }: AddAthletesScreenProps) {
  const t = useT();
  const registration = useCategoryRegistration(categoryId);
  const { state } = registration;

  if (state.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (state.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={state.message} />;
  }

  if (state.data === null) {
    return <FullScreenMessage title={t('common.notFound')} />;
  }

  return (
    <AddAthletesContent
      data={state.data}
      isBusy={registration.isBusy}
      errorKey={registration.errorKey}
      onAdd={(athleteId) => void registration.add(athleteId)}
    />
  );
}
