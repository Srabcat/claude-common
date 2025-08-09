/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },
  eslint: {
    // ESLint during build
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig