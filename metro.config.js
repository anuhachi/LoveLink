// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.
  isCSSEnabled: true,
});

defaultConfig.resolver.sourceExts = [
  ...defaultConfig.resolver.sourceExts,
  'mjs',
  'cjs',
];

module.exports = defaultConfig;
