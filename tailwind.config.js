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
        'judo-white': '#FBF8F1',
        'judo-blue': '#1D4ED8',
        // The one strong color. Keep it for the main action on a screen, so that the
        // next thing to do always stands out.
        accent: '#B3261E',
        'accent-light': '#F2A79F',
        // A warm paper-and-ink gray, replacing Tailwind's own stone colors.
        stone: {
          50: '#FDFBF6',
          100: '#F6F1E7',
          200: '#E8E0D1',
          300: '#D6CBB8',
          400: '#A99D8A',
          500: '#7E7364',
          600: '#5C5449',
          700: '#453E35',
          800: '#2A251F',
          900: '#1A1612',
        },
      },
    },
  },
  plugins: [],
};
