import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // Old links from the first version of the navigation
  async redirects() {
    return [
      { source: "/studio", destination: "/janvi-agarwal", permanent: true },
      { source: "/journal", destination: "/gallery", permanent: false },
      { source: "/destinations", destination: "/destination-weddings", permanent: true },
    ];
  },
};

export default nextConfig;
