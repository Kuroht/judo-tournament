/**
 * =====================================================
 * FILE: babel.config.js
 * PURPOSE: Tells Babel to compile `className` props on
 *          React Native components through NativeWind.
 * USED BY: Metro bundler (automatically)
 * =====================================================
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
