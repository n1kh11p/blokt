import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: '500mb',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb',
    },
  },
} as NextConfig;

export default nextConfig;
