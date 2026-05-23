import type { NextConfig } from "next";

// Enable verbose logging for debugging
if (process.env.NODE_ENV === 'production') {
  console.log('🔍 [BUILD] Starting Next.js build in production mode');
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // ✅ Image optimization configuration
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
      {
        protocol: 'https',
        hostname: 'honestneeds-backend.onrender.com',
      },
      {
        protocol: 'https',
        hostname: 'api.honestneed.com',
      },
      {
        protocol: 'https',
        hostname: '**.honestneed.com',
      },
    ],
  },
  
  // ✅ API Proxy
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
  
  // ✅ TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ✅ Styled Components
  compiler: {
    styledComponents: {
      displayName: process.env.NODE_ENV !== 'production',
      ssr: true,
      minify: process.env.NODE_ENV === 'production',
    },
  },
};

export default nextConfig;
