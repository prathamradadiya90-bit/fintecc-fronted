import type { NextConfig } from "next";

const backendUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, '') || 'https://fintecc-backend.vercel.app';

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', '@reduxjs/toolkit'],
  },
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth',
        permanent: false,
      },
      {
        source: '/signin',
        destination: '/auth',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
