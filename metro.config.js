const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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
    '@': path.resolve(__dirname, 'src'),
  },
};

module.exports = config;
