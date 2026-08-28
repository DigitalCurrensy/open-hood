import { DISCLAIMER, OSM_HONESTY } from "@/lib/directory/chains";
import { emptyZipMessage } from "@/lib/directory/empty-zip";
import { demoPlacesFor, isDemoZip } from "@/lib/directory/demo";
import { haversineMiles, isPlaceType } from "@/lib/directory/filters";
import { DIRECTORY_REVALIDATE, paidHook } from "@/lib/directory/http";
import { demoGeocode, geocodePlace } from "@/lib/directory/nominatim";
import { queryOverpass } from "@/lib/directory/overpass";
import { fetchGooglePlaces, fetchYelpPlaces, mergePlaces, placesKeyStatus } from "@/lib/directory/places";
import type { DirectoryPlace, DirectorySearchResult, PlaceType } from "@/lib/directory/types";

const memory = new Map<string, { at: number; value: DirectoryPlace[] }>();
const MEMORY_TTL_MS = DIRECTORY_REVALIDATE * 1000;

function paidHooks() {
  return [
    paidHook("google-places", "Google Places", "GOOGLE_PLACES_API_KEY", "stub"),
    paidHook("yelp-fusion", "Yelp Fusion", "YELP_API_KEY", "stub"),
    paidHook("marketcheck", "MarketCheck", "MARKETCHECK_API_KEY", false),
    paidHook("youtube-data", "YouTube Data API", "YOUTUBE_API_KEY", false),
  ];
}

function nowIso(at = Date.now()): string {
  return new Date(at).toISOString();
}

function withMiles(origin: { lat: number; lon: number }, places: DirectoryPlace[]): DirectoryPlace[] {
  return places
    .map((place) => ({
      ...place,
      miles: Math.round(haversineMiles(origin, place) * 10) / 10,
    }))
    .sort((a, b) => (a.miles ?? 99) - (b.miles ?? 99));
}

function hasPaidPin(places: DirectoryPlace[]): boolean {
  return places.some((place) => place.source === "google_places" || place.source === "yelp");
}

async function livePlaces(
  lat: number,
  lon: number,
  radiusM: number,
): Promise<{ places: DirectoryPlace[]; fetchedAt: number }> {
  const cacheKey = `${lat.toFixed(3)}:${lon.toFixed(3)}:${radiusM}`;
  const hit = memory.get(cacheKey);
  if (hit && Date.now() - hit.at < MEMORY_TTL_MS) {
    return { places: hit.value, fetchedAt: hit.at };
  }

  const keys = placesKeyStatus();
  const osmPromise = queryOverpass(lat, lon, radiusM).catch(() => [] as DirectoryPlace[]);
  const paidPromise = keys.connected
    ? Promise.all([
        keys.google ? fetchGooglePlaces(lat, lon, radiusM) : Promise.resolve([] as DirectoryPlace[]),
        keys.yelp ? fetchYelpPlaces(lat, lon, radiusM) : Promise.resolve([] as DirectoryPlace[]),
      ]).then((rows) => rows.flat())
    : Promise.resolve([] as DirectoryPlace[]);

  const [osm, extras] = await Promise.all([osmPromise, paidPromise]);
  const merged = mergePlaces(osm, extras);
  const fetchedAt = Date.now();
  if (merged.length) memory.set(cacheKey, { at: fetchedAt, value: merged });
  return { places: merged, fetchedAt };
}

function baseResult(
  query: string,
  rest: Omit<DirectorySearchResult, "query" | "attribution" | "paidHooks" | "updatedAt"> & {
    updatedAt?: string;
  },
): DirectorySearchResult {
  return {
    query,
    attribution: "© OpenStreetMap contributors",
    paidHooks: paidHooks(),
    ...rest,
    updatedAt: rest.updatedAt ?? nowIso(),
  };
}

export async function searchDirectory(input: {
  query: string;
  type?: string;
  radiusM?: number;
}): Promise<DirectorySearchResult> {
  const query = input.query.trim();
  const type = input.type && input.type !== "all" && isPlaceType(input.type) ? (input.type as PlaceType) : undefined;
  const radiusM = input.radiusM ?? 12_000;
  const keys = placesKeyStatus();

  const zipFault = emptyZipMessage(query);
  if (zipFault) {
    return baseResult(query, {
      geocode: null,
      places: [],
      source: "osm",
      timedOut: false,
      message: zipFault,
    });
  }

  const askedDemo = isDemoZip(query);
  const demo = askedDemo ? demoPlacesFor(query) : null;
  const geocode = (await geocodePlace(query)) ?? (askedDemo ? demoGeocode(query) : null);

  if (!geocode) {
    return baseResult(query, {
      geocode: null,
      places: [],
      source: "osm",
      timedOut: false,
      message: `Nominatim could not place “${query}”. We will not show another city's shops. Type a ZIP, or open a sample desk (90210 / 43215) if you want that cached map. ${OSM_HONESTY}`,
    });
  }

  const live = livePlaces(geocode.lat, geocode.lon, radiusM);
  const budgetMs = askedDemo ? 10_000 : 14_000;
  let bundle = await Promise.race([
    live,
    new Promise<{ places: DirectoryPlace[]; fetchedAt: number }>((resolve) => {
      setTimeout(() => resolve({ places: [], fetchedAt: Date.now() }), budgetMs);
    }),
  ]);
  let places = bundle.places;
  let timedOut = false;
  let source: DirectorySearchResult["source"] = hasPaidPin(places) ? "mixed" : "osm";
  let message = hasPaidPin(places)
    ? `${OSM_HONESTY} Extra pins from Google Places or Yelp because those keys are set.`
    : keys.connected
      ? OSM_HONESTY
      : `OSM only. ${OSM_HONESTY}`;

  if (!places.length) {
    if (demo) {
      timedOut = true;
      source = "demo";
      places = demo.places;
      bundle = { places, fetchedAt: Date.now() };
      message = `Overpass timed out or came back empty. You asked for ${demo.label}, so this is that cached map — not a city we guessed. ${OSM_HONESTY}`;
    } else {
      message = `No mapped rooftops in this radius. We did not substitute another city. ${OSM_HONESTY}`;
    }
  }

  const ranked = withMiles(geocode, places);
  const filtered = type
    ? ranked.filter((place) => place.type === type)
    : [
        ...ranked.filter((place) => place.type !== "fuel"),
        ...ranked.filter((place) => place.type === "fuel").slice(0, 3),
      ];
  const cap = 80;
  const visible = filtered.slice(0, cap);
  if (filtered.length > cap) {
    message = hasPaidPin(visible)
      ? `Showing the nearest ${cap} of ${filtered.length} mapped rooftops. ${OSM_HONESTY}`
      : keys.connected
        ? `Showing the nearest ${cap} of ${filtered.length} mapped rooftops. ${OSM_HONESTY}`
        : `Showing the nearest ${cap} of ${filtered.length} mapped rooftops. OSM only. ${OSM_HONESTY}`;
  }

  return baseResult(query, {
    geocode,
    places: visible,
    source,
    timedOut,
    updatedAt: nowIso(bundle.fetchedAt),
    message: visible.length ? message : `Nothing in that filter for this radius. ${DISCLAIMER}`,
  });
}

export function demoZipHint(query: string): boolean {
  return isDemoZip(query);
}
