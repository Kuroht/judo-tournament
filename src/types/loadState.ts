/**
 * =====================================================
 * FILE: loadState.ts
 * PURPOSE: The three states of any data read from the
 *          database.
 * USED BY: useFocusQuery.ts and every list screen
 * =====================================================
 */

// A union instead of isLoading and hasError booleans, so that impossible
// combinations like "loading and failed at once" can't be written at all.
export type LoadState<T> =
  | { type: 'loading' }
  | { type: 'error'; message: string }
  | { type: 'ready'; data: T };
