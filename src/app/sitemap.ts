import type { MetadataRoute } from "next";
import { BAY_NAV, CONSUMER_PATH } from "@/config/nav/consumer";
import { EXPERT_ROUTES } from "@/config/nav/expert";
import { JOB_ROUTES } from "@/config/nav/jobs";
import { LEGAL_SITEMAP_PATHS } from "@/config/nav/legal";
import { TRUST_SITEMAP_PATHS } from "@/config/nav/trust";
import { jobSlugs } from "@/lib/finder/jobs";
import { allGuides } from "@/lib/guides/glossary";
import { RO_TERMS } from "@/lib/jobs/glossary";
import { SITE_UPDATED } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";

const EXTRA_DESKS = ["/mechanic-mode", "/shops", "/catalog", "/sticker", "/agent/api"] as const;
const SKIP = new Set(["/offline", "/pricing", "/playbooks"]);
const HIGH = new Set(["/", "/quote", "/how-it-works", "/garage", "/directory", "/guides", "/finder", "/expert"]);

function entry(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
): MetadataRoute.Sitemap[number] {
  return {
    url: `${siteUrl()}${path === "/" ? "" : path}`,
    lastModified: SITE_UPDATED,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const desks = new Set<string>([
    "/",
    ...CONSUMER_PATH.map((item) => item.href),
    ...BAY_NAV.map((item) => item.href),
    ...LEGAL_SITEMAP_PATHS,
    ...TRUST_SITEMAP_PATHS,
    ...EXTRA_DESKS,
  ]);

  const deskEntries = [...desks]
    .filter((path) => !SKIP.has(path))
    .map((path) => entry(path, path === "/" ? 1 : HIGH.has(path) ? 0.9 : path.startsWith("/terms") || path.startsWith("/privacy") ? 0.4 : 0.7));

  const guides = allGuides().map((guide) => entry(`/guides/${guide.id}`, 0.6, "monthly"));
  const finder = jobSlugs().map((slug) => entry(`/finder/${slug}`, 0.6, "monthly"));
  const expert = EXPERT_ROUTES.filter((path) => !SKIP.has(path) && path !== "/expert").map((path) =>
    entry(path, 0.6, "monthly"),
  );
  const jobs = JOB_ROUTES.filter((path) => path !== "/jobs").map((path) => entry(path, 0.55, "monthly"));
  const terms = RO_TERMS.map((term) => entry(`/jobs/ro-terms/${term.slug}`, 0.45, "monthly"));
  const demoZips = ["90210", "43215"].map((zip) => entry(`/directory/${zip}`, 0.5, "weekly"));

  return [...deskEntries, ...guides, ...finder, ...expert, ...jobs, ...terms, ...demoZips];
}
