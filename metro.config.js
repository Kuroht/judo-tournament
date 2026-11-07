/**
 * =====================================================
 * FILE: metro.config.js
 * PURPOSE: Connects NativeWind to the Metro bundler and
 *          says where our Tailwind CSS entry file lives.
 * USED BY: Metro bundler (automatically)
 * =====================================================
 */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// In a browser, SQLite runs as a .wasm file, so Metro must be able to serve it.
// This is only for web testing. Android and iOS don't use it.
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, {
  // The path is custom because our CSS file lives in src/, not the project root.
  input: './src/global.css',
  // NativeWind's default is 14, which would make min-h-12 only 42 dp and shrink
  // all text. With 16, sizes match Tailwind's docs and min-h-12 is a true 48 dp.
  inlineRem: 16,
});
