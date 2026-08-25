import { DISCLAIMER } from "@/lib/directory/chains";
import { demoPlacesFor, isDemoZip } from "@/lib/directory/demo";
import { haversineMiles, isPlaceType } from "@/lib/directory/filters";
import { paidHook } from "@/lib/directory/http";
import { geocodePlace } from "@/lib/directory/nominatim";
import { queryOverpass } from "@/lib/directory/overpass";
import { fetchGooglePlaces, fetchYelpPlaces, mergePlaces } from "@/lib/directory/places";
import type { DirectoryPlace, DirectorySearchResult, PlaceType } from "@/lib/directory/types";

const memory = new Map<string, { at: number; value: DirectoryPlace[] }>();
const MEMORY_TTL_MS = 30 * 60 * 1000;

function paidHooks() {
  return [
    paidHook("google-places", "Google Places", "GOOGLE_PLACES_API_KEY", "stub"),
    paidHook("yelp-fusion", "Yelp Fusion", "YELP_API_KEY", "stub"),
    paidHook("marketcheck", "MarketCheck", "MARKETCHECK_API_KEY", false),
    paidHook("youtube-data", "YouTube Data API", "YOUTUBE_API_KEY", false),
  ];
}

function withMiles(origin: { lat: number; lon: number }, places: DirectoryPlace[]): DirectoryPlace[] {
  return places
    .map((place) => ({
      ...place,
      miles: Math.round(haversineMiles(origin, place) * 10) / 10,
    }))
    .sort((a, b) => (a.miles ?? 99) - (b.miles ?? 99));
}

async function livePlaces(lat: number, lon: number, radiusM: number): Promise<DirectoryPlace[]> {
  const cacheKey = `${lat.toFixed(3)}:${lon.toFixed(3)}:${radiusM}`;
  const hit = memory.get(cacheKey);
  if (hit && Date.now() - hit.at < MEMORY_TTL_MS) return hit.value;

  let osm: DirectoryPlace[] = [];
  try {
    osm = await queryOverpass(lat, lon, radiusM);
  } catch {
    osm = [];
  }

  const extras = await Promise.all([fetchGooglePlaces(lat, lon, radiusM), fetchYelpPlaces(lat, lon, radiusM)]);
  const merged = mergePlaces(osm, extras.flat());
  if (merged.length) memory.set(cacheKey, { at: Date.now(), value: merged });
  return merged;
}

export async function searchDirectory(input: {
  query: string;
  type?: string;
  radiusM?: number;
}): Promise<DirectorySearchResult> {
  const query = input.query.trim();
  const type = input.type && input.type !== "all" && isPlaceType(input.type) ? (input.type as PlaceType) : undefined;
  const radiusM = input.radiusM ?? 12_000;
  const hooks = paidHooks();

  if (!query) {
    return {
      query,
      geocode: null,
      places: [],
      source: "osm",
      timedOut: false,
      message: "Enter a ZIP or city.",
      attribution: "© OpenStreetMap contributors",
      paidHooks: hooks,
    };
  }

  const geocode = await geocodePlace(query);
  const demo = demoPlacesFor(query);

  if (!geocode) {
    return {
      query,
      geocode: null,
      places: [],
      source: "osm",
      timedOut: false,
      message: "Nominatim could not place that ZIP or city. Try 90210 or Columbus, OH.",
      attribution: "© OpenStreetMap contributors",
      paidHooks: hooks,
    };
  }

  const live = livePlaces(geocode.lat, geocode.lon, radiusM);
  const budgetMs = demo ? 10_000 : 14_000;
  let places = await Promise.race([
    live,
    new Promise<DirectoryPlace[]>((resolve) => {
      setTimeout(() => resolve([]), budgetMs);
    }),
  ]);
  let timedOut = false;
  let source: DirectorySearchResult["source"] = "osm";
  let message = DISCLAIMER;

  if (!places.length && demo) {
    timedOut = true;
    source = "demo";
    places = demo.places;
    message = `Overpass timed out or came back empty. Showing cached rooftops for ${demo.label} so this desk stays usable. ${DISCLAIMER}`;
  } else if (!places.length) {
    message = `No mapped rooftops in this radius. ${DISCLAIMER}`;
  } else if (places.some((place) => place.source !== "osm")) {
    source = "mixed";
  }

  const ranked = withMiles(geocode, places);
  const filtered = type
    ? ranked.filter((place) => place.type === type)
    : [
        ...ranked.filter((place) => place.type !== "fuel"),
        ...ranked.filter((place) => place.type === "fuel").slice(0, 3),
      ];

  return {
    query,
    geocode,
    places: filtered,
    source,
    timedOut,
    message: filtered.length ? message : `Nothing in that filter for this radius. ${DISCLAIMER}`,
    attribution: "© OpenStreetMap contributors",
    paidHooks: hooks,
  };
}

export function demoZipHint(query: string): boolean {
  return isDemoZip(query);
}
