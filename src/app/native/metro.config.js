// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.watchFolders = [
  path.resolve(__dirname, '../../shared'),
  path.resolve(__dirname, '../../../backend'),
];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [
    path.resolve(__dirname, 'node_modules'),
  ],
  alias: {
    '@/assets': path.resolve(__dirname, 'assets'),
    '@/*': path.resolve(__dirname, '../../shared/*'),
    '@shared/*': path.resolve(__dirname, '../../shared/*'),
    '@/shared/*': path.resolve(__dirname, '../../shared/*'),
    '@/features/*': path.resolve(__dirname, '../../shared/features/*'),
    '@/components/*': path.resolve(__dirname, '../../shared/components/*'),
    '@/core/*': path.resolve(__dirname, '../../shared/core/*'),
    '@/hooks/*': path.resolve(__dirname, '../../shared/hooks/*'),
    '@/services/*': path.resolve(__dirname, '../../shared/services/*'),
    '@/types/*': path.resolve(__dirname, '../../shared/types/*'),
    '@/utils/*': path.resolve(__dirname, '../../shared/utils/*'),
    '@/constants/*': path.resolve(__dirname, '../../shared/constants/*'),
    '@/config/*': path.resolve(__dirname, '../../shared/config/*'),
  },
};

module.exports = config;
