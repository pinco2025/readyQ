/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable Next.js branding and watermarks
  poweredByHeader: false,
  generateEtags: false,
  devIndicators: false
}

export default nextConfig
