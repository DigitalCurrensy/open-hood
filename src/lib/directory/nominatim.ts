import demoDirectory from "@/data/demo-directory.json";
import { isDemoZip } from "@/lib/directory/demo";
import { DIRECTORY_REVALIDATE, fetchJson, osmHeaders } from "@/lib/directory/http";
import type { GeocodeHit } from "@/lib/directory/types";

interface NominatimHit {
  display_name?: string;
  lat?: string;
  lon?: string;
}

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function demoGeocode(query: string): GeocodeHit | null {
  const key = normalizeQuery(query);
  const zipOnly = key.replace(/[^\d]/g, "");
  for (const location of demoDirectory.locations) {
    if (location.keys.some((item) => item === key || item === zipOnly)) {
      return {
        label: location.label,
        lat: location.lat,
        lon: location.lon,
        query,
      };
    }
  }
  return null;
}

function lookLikeUsZip(query: string): string | null {
  const match = query.trim().match(/^(\d{5})(?:-\d{4})?$/);
  return match?.[1] ?? null;
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeHit | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(lat),
      lon: String(lon),
    });
    const hit = await fetchJson<{
      display_name?: string;
      address?: { postcode?: string; city?: string; town?: string; village?: string; state?: string };
    }>(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: osmHeaders(),
      timeoutMs: 6_000,
      revalidate: DIRECTORY_REVALIDATE,
    });
    const zip = hit.address?.postcode?.match(/^(\d{5})/)?.[1] ?? "";
    const city = hit.address?.city || hit.address?.town || hit.address?.village || "";
    const query = zip || [city, hit.address?.state].filter(Boolean).join(", ") || hit.display_name || `${lat},${lon}`;
    return {
      label: hit.display_name ?? query,
      lat,
      lon,
      query,
    };
  } catch {
    return {
      label: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      lat,
      lon,
      query: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
    };
  }
}

export async function geocodePlace(query: string): Promise<GeocodeHit | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const cached = demoGeocode(trimmed);
  try {
    const zip = lookLikeUsZip(trimmed);
    const params = new URLSearchParams({
      format: "jsonv2",
      limit: "1",
      addressdetails: "0",
    });
    if (zip) {
      params.set("postalcode", zip);
      params.set("country", "USA");
    } else {
      params.set("q", trimmed);
      params.set("countrycodes", "us,ca");
    }
    const hits = await fetchJson<NominatimHit[]>(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: osmHeaders(),
        timeoutMs: 6_000,
        revalidate: DIRECTORY_REVALIDATE,
      },
    );
    const first = hits[0];
    const lat = Number.parseFloat(first?.lat ?? "");
    const lon = Number.parseFloat(first?.lon ?? "");
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return isDemoZip(trimmed) ? cached : null;
    }
    return {
      label: first?.display_name ?? trimmed,
      lat,
      lon,
      query: trimmed,
    };
  } catch {
    return isDemoZip(trimmed) ? cached : null;
  }
}
