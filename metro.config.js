// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable package exports to prevent ESM-first packages (like Zustand v5) 
// from exposing 'import.meta' syntax which is unsupported by Metro/Hermes.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
