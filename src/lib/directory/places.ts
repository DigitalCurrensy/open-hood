import { isDemoZip } from "@/lib/directory/demo";
import { classifyOsmTags, haversineMiles } from "@/lib/directory/filters";
import { demoGeocode, geocodePlace } from "@/lib/directory/nominatim";
import type { DirectoryPlace, GeocodeHit, PlaceType } from "@/lib/directory/types";

export const OSM_ONLY_MESSAGE = "OSM only";

export interface LivePlacesResult {
  connected: boolean;
  results: DirectoryPlace[];
  google: boolean;
  yelp: boolean;
  query: string;
  message: string;
  geocode: GeocodeHit | null;
}

export function placesKeyStatus(): { google: boolean; yelp: boolean; connected: boolean } {
  const google = Boolean(process.env.GOOGLE_PLACES_API_KEY?.trim());
  const yelp = Boolean(process.env.YELP_API_KEY?.trim());
  return { google, yelp, connected: google || yelp };
}

function placeKey(place: DirectoryPlace): string {
  return `${place.name.toLowerCase()}|${place.lat.toFixed(3)}|${place.lon.toFixed(3)}`;
}

function googleType(type: string): PlaceType | null {
  switch (type) {
    case "car_dealer":
      return "dealers";
    case "car_repair":
      return "repair";
    case "car_wash":
      return "carwash";
    case "gas_station":
      return "fuel";
    default:
      return classifyOsmTags({ shop: type.replace(/_/g, " ") });
  }
}

interface GoogleNearbyPlace {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  regularOpeningHours?: { weekdayDescriptions?: string[] };
}

export async function fetchGooglePlaces(
  lat: number,
  lon: number,
  radiusM: number,
): Promise<DirectoryPlace[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) return [];

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.location,places.types,places.regularOpeningHours",
      },
      body: JSON.stringify({
        includedTypes: ["car_dealer", "car_repair", "car_wash"],
        maxResultCount: 20,
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lon }, radius: radiusM },
        },
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { places?: GoogleNearbyPlace[] };
    return (payload.places ?? [])
      .map((place, index): DirectoryPlace | null => {
        const name = place.displayName?.text?.trim();
        const plat = place.location?.latitude;
        const plon = place.location?.longitude;
        if (!name || plat == null || plon == null) return null;
        const mapped =
          place.types?.map(googleType).find((item): item is PlaceType => Boolean(item)) ?? "repair";
        return {
          id: `gplaces-${place.id ?? index}`,
          name,
          type: mapped,
          address: place.formattedAddress ?? "",
          phone: place.nationalPhoneNumber ?? "",
          website: place.websiteUri ?? "",
          hours: place.regularOpeningHours?.weekdayDescriptions?.[0] ?? "",
          lat: plat,
          lon: plon,
          source: "google_places",
        };
      })
      .filter((place): place is DirectoryPlace => Boolean(place));
  } catch {
    return [];
  }
}

interface YelpBusiness {
  id?: string;
  name?: string;
  phone?: string;
  display_phone?: string;
  url?: string;
  coordinates?: { latitude?: number; longitude?: number };
  location?: { display_address?: string[] };
  categories?: { alias?: string; title?: string }[];
  hours?: { open?: unknown[] }[];
}

function yelpType(aliases: string[]): PlaceType {
  const joined = aliases.join(" ");
  if (aliases.includes("autodealers")) return "dealers";
  if (aliases.includes("autopartssupplies")) return "parts";
  if (aliases.includes("bodyshops") || aliases.includes("bodywork")) return "body";
  if (aliases.includes("tires")) return "tires";
  if (aliases.includes("towing")) return "towing";
  if (aliases.includes("carwash")) return "carwash";
  if (aliases.includes("smog_check_stations")) return "inspection";
  if (joined.includes("detail")) return "carwash";
  return "repair";
}

export async function fetchYelpPlaces(lat: number, lon: number, radiusM: number): Promise<DirectoryPlace[]> {
  const key = process.env.YELP_API_KEY?.trim();
  if (!key) return [];

  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      radius: String(Math.min(radiusM, 40_000)),
      categories: "autorepair,autodealers,autopartssupplies,tires,towing,carwash,bodyshops",
      limit: "20",
    });
    const response = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as { businesses?: YelpBusiness[] };
    return (payload.businesses ?? [])
      .map((biz, index): DirectoryPlace | null => {
        const name = biz.name?.trim();
        const plat = biz.coordinates?.latitude;
        const plon = biz.coordinates?.longitude;
        if (!name || plat == null || plon == null) return null;
        return {
          id: `yelp-${biz.id ?? index}`,
          name,
          type: yelpType((biz.categories ?? []).map((item) => item.alias ?? "")),
          address: (biz.location?.display_address ?? []).join(", "),
          phone: biz.display_phone || biz.phone || "",
          website: biz.url ?? "",
          hours: "",
          lat: plat,
          lon: plon,
          source: "yelp",
        };
      })
      .filter((place): place is DirectoryPlace => Boolean(place));
  } catch {
    return [];
  }
}

/** OSM (or first network) wins. Dedupe is name + ~111m grid (3 decimal degrees). */
export function mergePlaces(primary: DirectoryPlace[], extra: DirectoryPlace[]): DirectoryPlace[] {
  const seen = new Set(primary.map(placeKey));
  const merged = [...primary];
  for (const place of extra) {
    const key = placeKey(place);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(place);
  }
  return merged;
}

function disconnected(query: string): LivePlacesResult {
  return {
    connected: false,
    results: [],
    google: false,
    yelp: false,
    query,
    message: OSM_ONLY_MESSAGE,
    geocode: null,
  };
}

export async function queryLivePlaces(input: {
  query?: string;
  lat?: number;
  lon?: number;
  radiusM?: number;
}): Promise<LivePlacesResult> {
  const keys = placesKeyStatus();
  const query = input.query?.trim() ?? "";
  const radiusM = input.radiusM ?? 12_000;
  if (!keys.connected) return disconnected(query);

  let geocode: GeocodeHit | null = null;
  if (input.lat != null && input.lon != null && Number.isFinite(input.lat) && Number.isFinite(input.lon)) {
    geocode = {
      label: query || `${input.lat.toFixed(4)}, ${input.lon.toFixed(4)}`,
      lat: input.lat,
      lon: input.lon,
      query: query || `${input.lat.toFixed(4)}, ${input.lon.toFixed(4)}`,
    };
  } else if (query) {
    geocode = (await geocodePlace(query)) ?? (isDemoZip(query) ? demoGeocode(query) : null);
  }

  if (!geocode) {
    return {
      connected: true,
      results: [],
      google: keys.google,
      yelp: keys.yelp,
      query,
      message: query ? `Could not place “${query}”. OSM still runs.` : "Pass zip.",
      geocode: null,
    };
  }

  const [googleRows, yelpRows] = await Promise.all([
    keys.google ? fetchGooglePlaces(geocode.lat, geocode.lon, radiusM) : Promise.resolve([]),
    keys.yelp ? fetchYelpPlaces(geocode.lat, geocode.lon, radiusM) : Promise.resolve([]),
  ]);
  const merged = mergePlaces(googleRows, yelpRows)
    .map((place) => ({
      ...place,
      miles: Math.round(haversineMiles(geocode, place) * 10) / 10,
    }))
    .sort((a, b) => (a.miles ?? 99) - (b.miles ?? 99));

  const networks = [keys.google ? "Google Places" : "", keys.yelp ? "Yelp" : ""].filter(Boolean);
  return {
    connected: true,
    results: merged.slice(0, 40),
    google: keys.google,
    yelp: keys.yelp,
    query,
    message: merged.length
      ? `Live shop graph from ${networks.join(" + ")}. OSM stays on the Overpass sweep.`
      : "Keys are set. Those APIs returned no rooftops in this radius.",
    geocode,
  };
}
