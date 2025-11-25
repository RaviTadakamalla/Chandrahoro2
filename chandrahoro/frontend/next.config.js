/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  poweredByHeader: false, // Remove X-Powered-By header for security

  // Base path for deployment at /horo
  // Commented out for local development - uncomment for Azure deployment
  // basePath: '/horo',

  // Asset prefix for static files
  // Commented out for local development - uncomment for Azure deployment
  // assetPrefix: '/horo',

  eslint: {
    // Temporarily disable ESLint during builds for initial setup
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Completely ignore TypeScript during builds
    ignoreBuildErrors: true,
  },
  // Disable type checking during development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  experimental: {
    // typedRoutes: true, // Temporarily disabled for initial setup
    // optimizeCss: true, // Temporarily disabled due to critters dependency issue
    scrollRestoration: true,
  },
  images: {
    unoptimized: true, // Disable image optimization for local development
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.chandrahoro.com',
      },
      {
        protocol: 'https',
        hostname: 'valuestream.in',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
      },
    ],
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bundle analyzer (enable with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),
  async headers() {
    // Get API URL from environment variable or use default
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' data: blob:",
              `connect-src 'self' ${apiUrl} http://localhost:8000 http://localhost:8001 ws://localhost:3000 ws://localhost:3001 https://api.anthropic.com https://api.openai.com https://api.perplexity.ai https://generativelanguage.googleapis.com https://api.mistral.ai https://api.groq.com https://api.cohere.ai https://api.x.ai`,
              "worker-src 'self' blob:",
              "child-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'"
            ].join('; ')
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;