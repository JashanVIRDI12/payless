import type { MetadataRoute } from "next";
import { COMPANY } from "@/lib/site";

export const dynamic = "force-static";

/*
 * URLs use the canonical domain, matching metadataBase and the canonical tags,
 * not whichever host served the build. Add new routes here when pages are
 * added.
 */
const ROUTES: { path: string; priority: number; changeFrequency: "monthly" | "yearly" }[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.9, changeFrequency: "yearly" },
  { path: "/fleet", priority: 0.7, changeFrequency: "yearly" },
  { path: "/about", priority: 0.6, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${COMPANY.url}${path === "/" ? "" : path}`,
    changeFrequency,
    priority,
  }));
}
