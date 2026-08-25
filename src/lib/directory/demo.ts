import demoDirectory from "@/data/demo-directory.json";
import type { DirectoryPlace } from "@/lib/directory/types";

function normalize(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function demoPlacesFor(query: string): { label: string; places: DirectoryPlace[] } | null {
  const key = normalize(query);
  const zipOnly = key.replace(/[^\d]/g, "");
  const location = demoDirectory.locations.find(
    (item) => item.keys.includes(key) || (zipOnly.length === 5 && item.keys.includes(zipOnly)),
  );
  if (!location) return null;
  return {
    label: location.label,
    places: location.places.map((place) => ({
      ...place,
      source: "demo" as const,
    })) as DirectoryPlace[],
  };
}

export function isDemoZip(query: string): boolean {
  return demoPlacesFor(query) !== null;
}
