import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/site";

/*
 * Vercel preview deployments must never be indexed — they would compete with
 * the live site in search. Vercel also sends a noindex header on previews;
 * this is the second lock. Production (and any non-Vercel host) is open.
 */
const isPreview = process.env.VERCEL_ENV === "preview";

export default function robots(): MetadataRoute.Robots {
  if (isPreview) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${COMPANY.url}/sitemap.xml`,
  };
}
