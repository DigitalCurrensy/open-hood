/** Production host for canonicals, sitemap, robots, and crawler files. */
export function siteUrl(): string {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (fromVercel) return `https://${fromVercel.replace(/\/$/, "")}`;
  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromPublic) return fromPublic.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = siteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
