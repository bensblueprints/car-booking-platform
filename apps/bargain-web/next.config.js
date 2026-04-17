/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'le-cdn.hibuwebsites.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  transpilePackages: ['@carbooking/sdk'],
  output: 'standalone',
};
export default nextConfig;
