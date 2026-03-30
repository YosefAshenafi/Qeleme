import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native': 'react-native-web',
      'react-native-safe-area-context': false,
      'expo': false,
      'expo-modules-core': false,
    };
    return config;
  },
};

export default nextConfig;
