import { classifyOsmTags } from "@/lib/directory/filters";
import type { DirectoryPlace, PlaceType } from "@/lib/directory/types";

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

export function mergePlaces(primary: DirectoryPlace[], extra: DirectoryPlace[]): DirectoryPlace[] {
  const seen = new Set(
    primary.map((place) => `${place.name.toLowerCase()}|${place.lat.toFixed(3)}|${place.lon.toFixed(3)}`),
  );
  const merged = [...primary];
  for (const place of extra) {
    const key = `${place.name.toLowerCase()}|${place.lat.toFixed(3)}|${place.lon.toFixed(3)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(place);
  }
  return merged;
}
