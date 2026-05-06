import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // ppr: true, // Partial Prerendering
    // reactCompiler: true, // Enable React Compiler for better optimization - temporarily disabled due to babel plugin issues
    staleTimes: {
      dynamic: 30, // Cache dynamic data for 30 seconds
      static: 180, // Cache static data for 3 minutes
    },
    // Configure data cache settings
    // isrMemoryCacheSize: 0, // Disable in-memory cache for large datasets
  },
  // Optimize prefetching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
  images: {
    loader: "default",
  },
  // Enable better bundle analysis and tree shaking
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
  // Compress responses
  compress: true,
  // Enable static optimization hints
  poweredByHeader: false,
  // Generate static files where possible
  output: "standalone",
  // Disable static generation for pages that need database connection
  async generateBuildId() {
    return `build-${Date.now()}`;
  },
  // Force dynamic rendering for database-dependent pages
  async rewrites() {
    return [];
  },
  async redirects() {
    return [];
  },
};

export default withNextIntl(nextConfig);
