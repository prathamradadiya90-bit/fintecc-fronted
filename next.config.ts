import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
