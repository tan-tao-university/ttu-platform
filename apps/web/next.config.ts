import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Minimal server bundle for the Docker image — copies only the runtime files it needs.
  output: 'standalone',

  // Monorepo symlinks workspace packages. Without a tracing root at the repo root, the
  // standalone bundle silently omits them and the container crashes on first request.
  outputFileTracingRoot: fileURLToPath(new URL('../../', import.meta.url)),

  // The Ubuntu Nginx in front of this is the only thing that should advertise a stack.
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/api/mcp/asset/**',
      },
    ],
  },
};

export default nextConfig;
