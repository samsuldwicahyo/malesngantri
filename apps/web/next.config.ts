import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/auth/login/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/auth/register/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/t/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/t/:slug/admin',
        destination: '/:slug/admin',
        permanent: true,
      },
      {
        source: '/t/:slug/:path*',
        destination: '/:slug/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/customer/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:slug/queue',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/:slug/queue/:path*',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/:slug/barber',
        destination: '/:slug/admin?mode=worker',
        permanent: true,
      },
      {
        source: '/:slug/barber/:path*',
        destination: '/:slug/admin?mode=worker',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
