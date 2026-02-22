import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySizeLimit: '100mb',
  },
} as NextConfig;

export default nextConfig;
