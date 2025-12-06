/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'replicate.delivery',
      'pbxt.replicate.delivery',
      'images.unsplash.com',
      'via.placeholder.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.replicate.delivery',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
}

module.exports = nextConfig

