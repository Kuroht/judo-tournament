/**
 * =====================================================
 * FILE: useCategoryForm.ts
 * PURPOSE: The logic behind the add and edit category screen.
 * USED BY: CategoryFormScreen.tsx
 * =====================================================
 */
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';

import type { TranslationKey } from '@/lib/i18n/pt';

import { DEFAULT_CATEGORY_FORMAT } from '../categoryFormats';
import {
  createCategory,
  deleteCategory,
  getCategory,
  isCategoryDrawLocked,
  updateCategory,
} from '../db/categoryQueries';
import type { CategoryFormValues } from '../types';
import { validateCategoryForm, type CategoryFormErrors } from '../validateCategoryForm';

type FormStatus = 'loading' | 'ready' | 'notFound' | 'loadError';

type ActionError = { key: TranslationKey; values?: Record<string, number> } | null;

const EMPTY_VALUES: CategoryFormValues = {
  ageClassId: null,
  sex: 'male',
  label: '',
  minKg: '',
  maxKg: '',
  format: DEFAULT_CATEGORY_FORMAT,
  isFreeGrouping: false,
};

/**
 * Loads, validates, saves and deletes one category.
 * @param tournamentId the tournament it belongs to
 * @param categoryId the category to edit, or null to create a new one
 * @param onDone called after a successful save or delete
 */
export function useCategoryForm(
  tournamentId: string,
  categoryId: string | null,
  onDone: () => void,
) {
  const db = useSQLiteContext();
  const [status, setStatus] = useState<FormStatus>(categoryId === null ? 'ready' : 'loading');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [actionError, setActionError] = useState<ActionError>(null);
  const [isBusy, setIsBusy] = useState(false);
  // Two fast taps can both run before isBusy disables the button, because state only
  // changes on the next render. A ref changes at once, so the second tap is ignored.
  const isActionRunning = useRef(false);

  useEffect(() => {
    if (categoryId === null) {
      return;
    }

    getCategory(db, categoryId)
      .then((category) => {
        if (category === null) {
          setStatus('notFound');
          return;
        }
        setValues({
          ageClassId: category.ageClassId,
          sex: category.sex,
          label: category.label,
          minKg: category.minKg === null ? '' : String(category.minKg),
          maxKg: category.maxKg === null ? '' : String(category.maxKg),
          format: category.format,
          isFreeGrouping: category.isFreeGrouping,
        });
        setStatus('ready');
      })
      .catch(() => setStatus('loadError'));
  }, [db, categoryId]);

  /** Changes one field, and clears the errors because they're being fixed. */
  function setField<K extends keyof CategoryFormValues>(field: K, value: CategoryFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors({});
  }

  async function save() {
    if (isActionRunning.current) {
      return;
    }

    setActionError(null);
    const result = validateCategoryForm(values);

    if (result.type === 'invalid') {
      setErrors(result.errors);
      return;
    }

    isActionRunning.current = true;
    setIsBusy(true);
    try {
      if (categoryId === null) {
        await createCategory(db, tournamentId, result.data);
      } else if (await isCategoryDrawLocked(db, categoryId)) {
        setActionError({ key: 'draw.lockedMessage' });
        return;
      } else {
        await updateCategory(db, categoryId, result.data);
      }
      onDone();
    } catch {
      setActionError({ key: 'common.saveError' });
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  async function remove() {
    if (categoryId === null || isActionRunning.current) {
      return;
    }

    isActionRunning.current = true;
    setActionError(null);
    setIsBusy(true);
    try {
      const result = await deleteCategory(db, categoryId);
      if (result.type === 'deleted') {
        onDone();
      } else {
        setActionError({ key: 'categories.deleteBlocked', values: { count: result.entryCount } });
      }
    } catch {
      setActionError({ key: 'common.deleteError' });
    } finally {
      isActionRunning.current = false;
      setIsBusy(false);
    }
  }

  return { status, values, setField, errors, actionError, isBusy, save, remove };
}
