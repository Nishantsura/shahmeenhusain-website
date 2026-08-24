import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photography is served from the client's Shopify CDN and
    // optimised on the fly by next/image (the legacy site loaded these
    // raw, at up to 2608x3912).
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com", pathname: "/**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
