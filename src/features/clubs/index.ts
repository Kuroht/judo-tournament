/**
 * =====================================================
 * FILE: index.ts
 * PURPOSE: The public API of the clubs feature. Other code
 *          imports from here, never from its insides.
 * USED BY: src/app/clubs.tsx, src/app/club/*, the athletes feature
 * =====================================================
 */
export { ClubFormScreen } from './components/ClubFormScreen';
export { ClubsScreen } from './components/ClubsScreen';
export { useClubs } from './hooks/useClubs';
