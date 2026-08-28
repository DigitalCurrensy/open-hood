import chainsCatalog from "@/data/chains.json";
import { EMPTY_ZIP_HINT } from "@/lib/directory/empty-zip";

/** Primary honesty line. OSM is the map; we do not invent a national dealer database. */
export const OSM_HONESTY = "Shops near this pin from OpenStreetMap, refreshed hourly.";

export const DISCLAIMER = `${OSM_HONESTY} This is not a live national dealer database. Official chain locators stay outbound. Google Places / Yelp only merge when those keys are set.`;

export const EMPTY_LOCATION_HINT = EMPTY_ZIP_HINT;

export function chainLocators(query: string) {
  const trimmed = query.trim() || "near me";
  const zip = trimmed.match(/^(\d{5})(?:-\d{4})?$/)?.[1] ?? trimmed;
  const fill = (url: string) =>
    url.replaceAll("{query}", encodeURIComponent(trimmed)).replaceAll("{zip}", encodeURIComponent(zip));
  return {
    retail: chainsCatalog.retail.map((chain) => ({ ...chain, href: fill(chain.locatorUrl) })),
    dealerGroups: chainsCatalog.dealerGroups.map((group) => ({ ...group, href: fill(group.locatorUrl) })),
  };
}
