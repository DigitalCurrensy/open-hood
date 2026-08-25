import type { MetadataRoute } from "next";
import { NAV_ITEMS } from "@/lib/nav";

function siteUrl(): string {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (fromVercel) return `https://${fromVercel}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const paths = ["/pricing", ...NAV_ITEMS.map((item) => item.href)];
  return paths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
