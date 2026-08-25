import type { PlaceType } from "@/lib/directory/types";
import { PLACE_TYPES } from "@/lib/directory/types";

export const FILTER_CHIPS: { id: PlaceType | "all"; label: string }[] = [
  { id: "all", label: "All rooftops" },
  { id: "dealers", label: "Dealers" },
  { id: "parts", label: "Parts" },
  { id: "repair", label: "Repair" },
  { id: "body", label: "Body" },
  { id: "tires", label: "Tires" },
  { id: "towing", label: "Towing" },
  { id: "inspection", label: "Inspection" },
  { id: "carwash", label: "Car wash" },
];

export function isPlaceType(value: string): value is PlaceType {
  return (PLACE_TYPES as readonly string[]).includes(value);
}

export function typeLabel(type: PlaceType): string {
  switch (type) {
    case "dealers":
      return "Dealer";
    case "parts":
      return "Parts";
    case "repair":
      return "Independent / repair";
    case "body":
      return "Body / collision";
    case "tires":
      return "Tires";
    case "towing":
      return "Towing";
    case "inspection":
      return "Inspection / smog";
    case "carwash":
      return "Wash / detail";
    case "fuel":
      return "Fuel";
  }
}

function truthy(tags: Record<string, string>, key: string): boolean {
  const value = tags[key]?.toLowerCase();
  return value === "yes" || value === "true" || value === "1";
}

function hay(tags: Record<string, string>): string {
  return [tags.name, tags.brand, tags.operator, tags["service:vehicle"], tags.shop]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function classifyOsmTags(tags: Record<string, string>): PlaceType | null {
  const shop = tags.shop ?? "";
  const amenity = tags.amenity ?? "";
  const office = tags.office ?? "";
  const craft = tags.craft ?? "";
  const text = hay(tags);

  if (
    shop === "towing" ||
    amenity === "towing" ||
    office === "towing" ||
    amenity === "tow_truck" ||
    truthy(tags, "service:vehicle:towing") ||
    /\btow(ing)?\b/.test(text)
  ) {
    return "towing";
  }

  if (
    amenity === "vehicle_inspection" ||
    truthy(tags, "service:vehicle:inspection") ||
    /\b(smog|e-check|inspection|state inspect)\b/.test(text)
  ) {
    return "inspection";
  }

  if (
    shop === "car_detail" ||
    amenity === "car_wash" ||
    truthy(tags, "car_wash") ||
    /\b(detail|car wash|carwash)\b/.test(text)
  ) {
    return "carwash";
  }

  if (
    shop === "tyres" ||
    truthy(tags, "service:vehicle:tyres") ||
    /\b(tire|tyre)\b/.test(text)
  ) {
    return "tires";
  }

  if (
    craft === "coachbuilder" ||
    shop === "body_shop" ||
    truthy(tags, "service:vehicle:body_repair") ||
    /\b(body|collision|autobody|auto body)\b/.test(text)
  ) {
    return "body";
  }

  if (shop === "car") return "dealers";
  if (shop === "car_parts") return "parts";
  if (shop === "car_repair") return "repair";
  if (amenity === "fuel") return "fuel";
  return null;
}

export function haversineMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function mapsLink(place: { name: string; address: string; lat: number; lon: number }): string {
  const q = place.address || `${place.lat},${place.lon}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${q}`)}`;
}

export function osmLink(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

export function telHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 7) return null;
  return `tel:${digits}`;
}
