import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const serverRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: serverRoot,
};

export default nextConfig;
