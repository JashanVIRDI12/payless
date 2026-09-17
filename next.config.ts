import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Apache serves /about/index.html for /about/ without rewrite rules.
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    // Static exports do not include Next.js' image optimization server.
    unoptimized: true,
    // Each value here is requested by at least one <Image quality={...}>;
    // Next clamps anything not on this list down to the nearest allowed value.
    // 92 is for the logo — a hard-edged wordmark shows WebP ringing earlier
    // than a photograph does.
    qualities: [70, 75, 78, 80, 82, 92],
  },
};

export default nextConfig;
