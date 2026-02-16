import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [100],
    domains: ["cdn.shopify.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", 
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
    ],
  }
};

export default nextConfig;
