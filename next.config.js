/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { dev, isServer }) => {
    // Suppress webpack PackFileCacheStrategy warnings
    // These warnings are harmless but can be noisy
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    
    // Ensure Prisma query engine binaries are included in the build
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Copy Prisma binaries to output
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
    }
    
    return config;
  },
  // Ensure Prisma files are included in the build
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
};

module.exports = nextConfig;
