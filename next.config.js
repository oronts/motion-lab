/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/motion-lab' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/motion-lab/' : '',
};

module.exports = nextConfig;