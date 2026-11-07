/**
 * =====================================================
 * FILE: index.tsx
 * PURPOSE: The tournaments tab route. The real screen lives
 *          in the tournaments feature.
 * USED BY: Expo Router (automatically)
 * =====================================================
 */
import { TournamentsScreen } from '@/features/tournaments';

export default function TournamentsRoute() {
  return <TournamentsScreen />;
}
