
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://placehold.co https://*.walletconnect.com https://*.walletconnect.org; connect-src 'self' wss://*.bridge.walletconnect.org https://*.rpc.walletconnect.com https://explorer.walletconnect.com https://pulse.walletconnect.org https://verify.walletconnect.com; frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org;";
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(), // Basic minification
          },
        ],
      },
    ]
  },
};

export default nextConfig;
