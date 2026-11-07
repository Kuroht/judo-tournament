/**
 * =====================================================
 * FILE: tailwind.config.js
 * PURPOSE: Configures which files Tailwind scans for
 *          classes, plus the app's judo colors.
 * USED BY: NativeWind (at build time)
 * =====================================================
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Every file that uses a className must match this pattern,
  // otherwise its classes are silently missing from the app.
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  // "class" lets the trainer choose the theme in settings.
  // The default ("media") would make manual switching throw an error.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Kept the same in both themes so the two sides never get confused.
        'judo-white': '#F8FAFC',
        'judo-blue': '#1D4ED8',
      },
    },
  },
  plugins: [],
};
