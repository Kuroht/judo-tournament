/**
 * =====================================================
 * FILE: eslint.config.js
 * PURPOSE: Configures the code checks that `npm run lint`
 *          runs, using Expo's recommended rules.
 * USED BY: ESLint
 * =====================================================
 */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'docs/*'],
  },
]);
