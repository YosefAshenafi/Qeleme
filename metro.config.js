// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, 'src'),
];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
  alias: {
    // `@/assets` must precede `@` so `@/assets/…` resolves to repo `assets/`, not `src/assets/`.
    '@/assets': path.resolve(__dirname, 'assets'),
    '@': path.resolve(__dirname, 'src'),
  },
};

module.exports = config;
