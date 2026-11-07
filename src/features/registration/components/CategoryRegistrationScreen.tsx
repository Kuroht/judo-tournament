/**
 * =====================================================
 * FILE: CategoryRegistrationScreen.tsx
 * PURPOSE: Loads a category, then shows the athletes
 *          registered in it.
 * USED BY: src/app/tournament/[id]/category-registration/
 *          [categoryId]/athletes.tsx
 * =====================================================
 */
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { useT } from '@/lib/i18n/useT';

import { useCategoryRegistration } from '../hooks/useCategoryRegistration';
import { CategoryRegistrationContent } from './CategoryRegistrationContent';

type CategoryRegistrationScreenProps = {
  tournamentId: string;
  categoryId: string;
};

export function CategoryRegistrationScreen({
  tournamentId,
  categoryId,
}: CategoryRegistrationScreenProps) {
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
    <CategoryRegistrationContent
      tournamentId={tournamentId}
      data={state.data}
      isBusy={registration.isBusy}
      errorKey={registration.errorKey}
      onRemove={(entryId) => void registration.remove(entryId)}
    />
  );
}
