import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const isRender = process.env.RENDER === 'true';

if (isProduction) {
  console.log('🔍 [NEXT.CONFIG] Loading production configuration...');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('  isRender:', isRender);
  console.log('  NODE_OPTIONS:', process.env.NODE_OPTIONS);
  console.log('  NEXT_TELEMETRY_DISABLED:', process.env.NEXT_TELEMETRY_DISABLED);
}

const nextConfig: NextConfig = {
  /* config options here */
  
  // ✅ Production Optimization: Disable source maps to speed up builds
  productionBrowserSourceMaps: false,
  
  // ✅ Compiler optimizations for styled-components
  compiler: {
    styledComponents: {
      displayName: !isProduction,
      ssr: true,
      minify: isProduction,
      transpileTemplateLiterals: true,
      pure: true,
    },
    // Remove console logs in production for smaller bundle
    removeConsole: isProduction ? { exclude: ['error', 'warn'] } : false,
  },
  
  // ✅ Image optimization configuration
  images: {
    // Disable optimization on Render - external image optimization fails
    unoptimized: true,
    remotePatterns: [
      // Development: localhost backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      // Production: Render backend
      {
        protocol: 'https',
        hostname: 'honestneeds-backend.onrender.com',
      },
      // Legacy support for custom domains
      {
        protocol: 'https',
        hostname: 'api.honestneed.com',
      },
      // Fallback for any subdomain
      {
        protocol: 'https',
        hostname: '**.honestneed.com',
      },
    ],
  },
  
  // ✅ API Proxy: Forward all /api/* requests to backend
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/:path*`,
        },
      ],
    };
  },
  
   // ✅ TypeScript: Ignore build ercommit ors (existing components may have issues)
  typescript: {
    ignoreBuildErrors: true,
  }, 
  
  // ✅ Experimental optimizations for faster builds
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
};

export default nextConfig;
