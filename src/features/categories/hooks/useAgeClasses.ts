/**
 * =====================================================
 * FILE: useAgeClasses.ts
 * PURPOSE: Gives a screen the list of age classes.
 * USED BY: AddFpjCategoriesScreen.tsx, CategoryFormFields.tsx
 * =====================================================
 */
import { useFocusQuery } from '@/hooks/useFocusQuery';
import type { LoadState } from '@/types/loadState';

import { listAgeClasses } from '../db/categoryQueries';
import type { AgeClassOption } from '../types';

/** Reads the age classes. @returns the loading, error or ready state */
export function useAgeClasses(): LoadState<AgeClassOption[]> {
  return useFocusQuery(listAgeClasses);
}
