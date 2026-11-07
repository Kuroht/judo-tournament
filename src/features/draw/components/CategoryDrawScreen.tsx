/**
 * =====================================================
 * FILE: CategoryDrawScreen.tsx
 * PURPOSE: Loads one category's draw, then shows it.
 * USED BY: src/app/tournament/[id]/category-draw/
 *          [categoryId]/details.tsx
 * =====================================================
 */
import { FullScreenMessage } from '@/components/FullScreenMessage';
import { useT } from '@/lib/i18n/useT';

import { useCategoryDraw } from '../hooks/useCategoryDraw';
import { CategoryDrawContent } from './CategoryDrawContent';

type CategoryDrawScreenProps = {
  categoryId: string;
};

export function CategoryDrawScreen({ categoryId }: CategoryDrawScreenProps) {
  const t = useT();
  const draw = useCategoryDraw(categoryId);
  const { state } = draw;

  if (state.type === 'loading') {
    return <FullScreenMessage title={t('common.loading')} />;
  }

  if (state.type === 'error') {
    return <FullScreenMessage title={t('common.loadError')} details={state.message} />;
  }

  if (state.data === null) {
    return <FullScreenMessage title={t('common.notFound')} />;
  }

  return <CategoryDrawContent data={state.data} draw={draw} />;
}
