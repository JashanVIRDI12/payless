import type { NextConfig } from "next";

/*
 * Response headers for every route. Deliberately conservative:
 *
 *  - No HSTS here. Vercel already sends it, and adding includeSubDomains or
 *    preload would commit every subdomain of paylesstowing.ca to HTTPS,
 *    including ones this project doesn't control (mail and so on).
 *  - No Content-Security-Policy yet. The layout ships two inline scripts (the
 *    motion flag and the JSON-LD), so a CSP needs nonce plumbing first or it
 *    will silently break the hero animation and the structured data.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Each value here is requested by at least one <Image quality={...}>;
    // Next clamps anything not on this list down to the nearest allowed value.
    // 92 is for the logo — a hard-edged wordmark shows WebP ringing earlier
    // than a photograph does.
    qualities: [70, 75, 78, 80, 82, 92],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
