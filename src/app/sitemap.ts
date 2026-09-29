import type { MetadataRoute } from "next";
import { listStates } from "@/lib/overtime/registry";

// Required for static export (`output: "export"`) -- see
// https://nextjs.org/docs/advanced-features/static-html-export
export const dynamic = "force-static";

/**
 * Generated sitemap -- replaces the hand-written public/sitemap.xml
 * (removed) now that the site has more than two static pages. Static
 * export (`output: "export"`) prerenders this to sitemap.xml at build
 * time just like any other route.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://paycheckovertime.com";
  const lastModified = new Date("2026-09-12");

  return [
    { url: `${base}/`, lastModified, changeFrequency: "monthly", priority: 1.0 },
    { url: `${base}/overtime`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/biweekly-overtime-calculator`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    ...listStates().map((s) => ({
      url: `${base}/overtime/${s.code.toLowerCase()}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${base}/about`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/contact`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
