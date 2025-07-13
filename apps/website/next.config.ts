import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'chariot-images.s3.eu-north-1.amazonaws.com',
      },
    ],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
