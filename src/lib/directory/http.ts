import { BRAND } from "@/lib/brand";

export const DIRECTORY_USER_AGENT = `OpenHood/0.1 (automotive-directory; ${BRAND.githubRepo})`;

/** OSM Overpass + Nominatim: one hour. Timeout still falls back to ZIP samples. */
export const DIRECTORY_REVALIDATE = 3600;

export function osmHeaders(extra?: HeadersInit): HeadersInit {
  return {
    Accept: "application/json",
    "User-Agent": DIRECTORY_USER_AGENT,
    Referer: BRAND.githubRepo,
    ...extra,
  };
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number; revalidate?: number } = {},
): Promise<T> {
  const { timeoutMs = 12_000, revalidate, ...rest } = init;
  const response = await fetch(url, {
    ...rest,
    headers: { ...osmHeaders(rest.headers), ...(rest.headers ?? {}) },
    signal: AbortSignal.timeout(timeoutMs),
    ...(revalidate === undefined
      ? {}
      : { cache: "force-cache" as const, next: { revalidate } }),
  });
  if (!response.ok) {
    throw new Error(`${new URL(url).host} returned ${response.status}`);
  }
  return (await response.json()) as T;
}

export function paidHook(id: string, name: string, env: string, wired: boolean | "stub"): {
  id: string;
  name: string;
  env: string;
  configured: boolean;
  wired: boolean | "stub";
} {
  return {
    id,
    name,
    env,
    configured: Boolean(process.env[env]?.trim()),
    wired,
  };
}
