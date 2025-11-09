/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
  },
  // Optimize bundle size
  swcMinify: true,
  // Enable compression
  compress: true,
  // Performance optimizations
  poweredByHeader: false,
}

module.exports = nextConfig



