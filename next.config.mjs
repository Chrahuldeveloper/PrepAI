/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
        unoptimized: true, 
  },
  reactStrictMode: true,

};

export default nextConfig;
