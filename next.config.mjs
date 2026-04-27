/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Strict Mode — prevents double-mount causing Supabase lock conflicts
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
