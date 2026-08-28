export const DIRECTORY_RESERVED = new Set(["parts"]);

export function isZipQuery(value: string): boolean {
  return /^\d{5}(?:-\d{4})?$/.test(value.trim());
}

/** Path segment → search query. `90210` stays a ZIP; `beverly-hills` becomes `beverly hills`. */
export function directoryPathToQuery(segment: string): string {
  const raw = decodeURIComponent(segment).trim();
  if (!raw) return "";
  if (isZipQuery(raw)) return raw;
  return raw.replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

export function directorySearchHref(q: string, type = "all"): string {
  const query = q.trim();
  const params = new URLSearchParams();
  if (type && type !== "all") params.set("type", type);

  if (isZipQuery(query)) {
    const qs = params.toString();
    return `/directory/${query}${qs ? `?${qs}` : ""}`;
  }

  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/directory?${qs}` : "/directory";
}

export const DIRECTORY_EXAMPLES = [
  { href: "/directory/90210", label: "90210", query: "90210" },
  { href: "/directory/43215", label: "43215", query: "43215" },
  { href: "/directory/columbus", label: "Columbus", query: "columbus" },
] as const;
