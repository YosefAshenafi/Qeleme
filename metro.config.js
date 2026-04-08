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
    '@/assets': path.resolve(__dirname, 'assets'),
    '@/*': path.resolve(__dirname, 'src/*'),
    '@shared/*': path.resolve(__dirname, 'src/*'),
    '@/shared/*': path.resolve(__dirname, 'src/*'),
    '@/features/*': path.resolve(__dirname, 'src/features/*'),
    '@/components/*': path.resolve(__dirname, 'src/components/*'),
    '@/core/*': path.resolve(__dirname, 'src/core/*'),
    '@/hooks/*': path.resolve(__dirname, 'src/hooks/*'),
    '@/services/*': path.resolve(__dirname, 'src/services/*'),
    '@/types/*': path.resolve(__dirname, 'src/types/*'),
    '@/utils/*': path.resolve(__dirname, 'src/utils/*'),
    '@/constants/*': path.resolve(__dirname, 'src/constants/*'),
    '@/config/*': path.resolve(__dirname, 'src/config/*'),
  },
};

module.exports = config;
