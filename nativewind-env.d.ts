/**
 * =====================================================
 * FILE: nativewind-env.d.ts
 * PURPOSE: Teaches TypeScript that React Native components
 *          accept a `className` prop.
 * USED BY: TypeScript compiler
 * NOTE: NativeWind's docs warn not to rename this file to
 *       nativewind.d.ts, or the types stop being picked up.
 * =====================================================
 */
/// <reference types="nativewind/types" />

// Lets TypeScript accept `import '@/global.css'`. Without this it reports
// an error, because a CSS file has no types of its own.
declare module '*.css';
