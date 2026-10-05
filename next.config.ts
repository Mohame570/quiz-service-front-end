import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    const apiRewriteTarget = (
      process.env.API_REWRITE_TARGET ?? 'http://localhost:3002'
    ).replace(/\/+$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${apiRewriteTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
