import { directorySearchHref } from "@/lib/directory/href";
import type { DirectoryPlace, DirectorySearchResult } from "@/lib/directory/types";

export type ShortlistFilter = "repair" | "dealers" | "all";

export type ShopShortlist =
  | { kind: "idle" }
  | { kind: "missing-api"; href: string }
  | { kind: "error"; message: string; href: string }
  | { kind: "empty"; message: string; href: string }
  | {
      kind: "ready";
      places: DirectoryPlace[];
      href: string;
      source: string;
      attribution: string;
    };

let directoryApi: boolean | null = null;

export async function fetchShopShortlist(
  zip: string,
  type: ShortlistFilter = "repair",
): Promise<ShopShortlist> {
  const query = zip.trim();
  const href = directorySearchHref(query, type === "all" ? "all" : type);
  if (!/^\d{5}$/.test(query)) {
    return { kind: "idle" };
  }
  if (directoryApi === false) {
    return { kind: "missing-api", href };
  }

  try {
    const params = new URLSearchParams({ q: query, type });
    const response = await fetch(`/api/directory/search?${params.toString()}`, { cache: "no-store" });
    if (response.status === 404) {
      directoryApi = false;
      return { kind: "missing-api", href };
    }
    directoryApi = true;
    const body = (await response.json()) as DirectorySearchResult & { error?: string };
    if (!response.ok) {
      return { kind: "error", message: body.error || "Directory search missed.", href };
    }
    const places = (body.places ?? []).slice(0, 6);
    if (!places.length) {
      return {
        kind: "empty",
        message: body.message || "No rooftops in that radius. Open the full directory.",
        href,
      };
    }
    return {
      kind: "ready",
      places,
      href,
      source: body.source,
      attribution: body.attribution,
    };
  } catch {
    return {
      kind: "error",
      message: "The directory line dropped. Open the ZIP desk instead.",
      href,
    };
  }
}
