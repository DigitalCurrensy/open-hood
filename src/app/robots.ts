import type { MetadataRoute } from "next";
import { CRAWLER_ALLOWLIST, ROBOTS_API_ALLOW, ROBOTS_DISALLOW } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";

const SHARED = {
  allow: ["/", ...ROBOTS_API_ALLOW],
  disallow: [...ROBOTS_DISALLOW],
};

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        ...SHARED,
      },
      {
        userAgent: [...CRAWLER_ALLOWLIST],
        ...SHARED,
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
