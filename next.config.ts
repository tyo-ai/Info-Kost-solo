import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disables double-mount in dev which can cause Leaflet map already initialized error
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;

