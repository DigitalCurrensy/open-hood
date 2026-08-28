import type { NavItem } from "@/lib/nav";

/** Stamp for the bay board. Merge into NAV_ITEMS or import next to it in site-nav. */
export const INTEGRATIONS_NAV_ITEM: NavItem = {
  href: "/integrations",
  stamp: "Lines",
  label: "Integrations",
  blurb: "Third-party lines that actually open — NHTSA, EPA, maps, parts, auctions.",
  needsVehicle: false,
};

export const INTEGRATIONS_ROUTE = "/integrations" as const;

export const INTEGRATION_FAMILIES = [
  { id: "safety", stamp: "Safety", label: "NHTSA / IIHS" },
  { id: "fuel", stamp: "Fuel", label: "EPA / Fuelly" },
  { id: "maps", stamp: "Maps", label: "OSM / directions" },
  { id: "parts", stamp: "Parts", label: "Counter search" },
  { id: "shops", stamp: "Shops", label: "Research link-outs" },
  { id: "auctions", stamp: "Lanes", label: "Public / salvage" },
  { id: "video", stamp: "How-to", label: "YouTube / guides" },
  { id: "history", stamp: "History", label: "Carfax consumer" },
  { id: "licensed", stamp: "Keys", label: "Env + paid hooks" },
] as const;
