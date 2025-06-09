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
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.walletconnect.com https://*.walletconnect.com https://api.web3modal.org;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: blob: https://cdn.walletconnect.com https://*.walletconnect.com https://api.web3modal.org https://placehold.co;
              font-src 'self' https://fonts.gstatic.com https://cdn.walletconnect.com https://*.walletconnect.com;
              connect-src 'self'
                wss://relay.walletconnect.org
                https://rpc.walletconnect.org
                https://api.web3modal.org
                https://cdn.walletconnect.com
                https://*.walletconnect.com
                https://pulse.walletconnect.org;
              frame-src 'self';
              object-src 'none';
              base-uri 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.walletconnect.com https://*.walletconnect.com https://api.web3modal.org;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: blob: https://cdn.walletconnect.com https://*.walletconnect.com https://api.web3modal.org https://placehold.co;
              font-src 'self' https://fonts.gstatic.com https://cdn.walletconnect.com https://*.walletconnect.com;
              connect-src 'self'
                wss://relay.walletconnect.org
                https://rpc.walletconnect.org
                https://api.web3modal.org
                https://cdn.walletconnect.com
                https://*.walletconnect.com
                https://pulse.walletconnect.org;
              frame-src 'self';
              object-src 'none';
              base-uri 'self';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("pino-pretty", "lokijs", "encoding");
    }
    return config;
  },
};

export default nextConfig;
