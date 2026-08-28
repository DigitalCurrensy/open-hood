import { classifyOsmTags, websiteHref } from "@/lib/directory/filters";
import { DIRECTORY_REVALIDATE, DIRECTORY_USER_AGENT, osmHeaders } from "@/lib/directory/http";
import type { DirectoryPlace } from "@/lib/directory/types";

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements?: OverpassElement[];
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function aroundQuery(lat: number, lon: number, radiusM: number): string {
  const around = `(around:${Math.round(radiusM)},${lat.toFixed(5)},${lon.toFixed(5)})`;
  return `[out:json][timeout:18];
(
  nwr["shop"="car"]${around};
  nwr["shop"="car_parts"]${around};
  nwr["shop"="car_repair"]${around};
  nwr["shop"="tyres"]${around};
  nwr["shop"="car_detail"]${around};
  nwr["shop"="towing"]${around};
  nwr["amenity"="fuel"]${around};
  nwr["amenity"="car_wash"]${around};
  nwr["amenity"="vehicle_inspection"]${around};
  nwr["amenity"="towing"]${around};
  nwr["office"="towing"]${around};
  nwr["craft"="coachbuilder"]${around};
);
out center tags;`;
}

function formatAddress(tags: Record<string, string>): string {
  if (tags["addr:full"]) return tags["addr:full"];
  const line = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
  const city = [tags["addr:city"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(", ");
  return [line, city].filter(Boolean).join(", ");
}

function placeFromElement(element: OverpassElement): DirectoryPlace | null {
  const tags = element.tags ?? {};
  const name = (tags.name || tags.brand || tags.operator || "").trim();
  if (!name) return null;
  const type = classifyOsmTags(tags);
  if (!type) return null;
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    id: `osm-${element.type}-${element.id}`,
    name,
    type,
    address: formatAddress(tags),
    phone: tags.phone || tags["contact:phone"] || "",
    website: websiteHref(tags.website || tags["contact:website"] || "") ?? "",
    hours: tags.opening_hours || "",
    lat: lat as number,
    lon: lon as number,
    source: "osm",
  };
}

async function postOverpass(endpoint: string, query: string): Promise<DirectoryPlace[]> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...osmHeaders({ "Content-Type": "application/x-www-form-urlencoded" }),
      "User-Agent": DIRECTORY_USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(10_000),
    cache: "force-cache",
    next: { revalidate: DIRECTORY_REVALIDATE },
  });
  if (!response.ok) {
    throw new Error(`Overpass ${response.status}`);
  }
  const payload = (await response.json()) as OverpassResponse;
  const seen = new Set<string>();
  const places: DirectoryPlace[] = [];
  for (const element of payload.elements ?? []) {
    const place = placeFromElement(element);
    if (!place) continue;
    const key = `${place.name.toLowerCase()}|${place.lat.toFixed(4)}|${place.lon.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    places.push(place);
  }
  return places;
}

export async function queryOverpass(lat: number, lon: number, radiusM = 12_000): Promise<DirectoryPlace[]> {
  const query = aroundQuery(lat, lon, radiusM);
  let lastError: unknown;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      return await postOverpass(endpoint, query);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Overpass timed out");
}
