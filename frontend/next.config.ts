/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/dadmbqpnd/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  reactStrictMode: true,

  // Disable ESLint build errors
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript build errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
