/**
 * =====================================================
 * FILE: useGoBack.ts
 * PURPOSE: Leaves the current screen safely.
 * USED BY: form screens
 * =====================================================
 */
import { useRouter, type Href } from 'expo-router';

/**
 * Gives a function that returns to the previous screen.
 * @param fallback where to go if there is no previous screen, which happens
 *                 when a page is opened directly in a browser during testing
 * @returns the function to call
 */
export function useGoBack(fallback: Href): () => void {
  const router = useRouter();

  return () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallback);
    }
  };
}
