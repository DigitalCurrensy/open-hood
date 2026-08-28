import type { NavItem } from "@/lib/nav";

export const CATALOG_ROUTE = "/catalog" as const;

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS / MATRIX_NAV_ITEMS.
 * Counts are literals so the client nav does not pull the JSON book. */
export const CATALOG_NAV_ITEM: NavItem = {
  href: CATALOG_ROUTE,
  stamp: "Book",
  label: "Fluids book",
  blurb: "216 year/make/model rows + 90 filter cross-refs. Confirm the door jamb. Not TecDoc.",
  needsVehicle: false,
};

export const CATALOG_INDEX = {
  href: CATALOG_ROUTE,
  stamp: "Book",
  label: "Fluids book",
  blurb: "Search factory-typical oil, coolant, ATF, brake DOT, PSI, and filter SKUs. Heuristic still catches misses on the garage card.",
} as const;

export const CATALOG_NEXT_DESKS = [
  { href: "/garage", stamp: "Garage", label: "This car’s card" },
  { href: "/parts", stamp: "Parts", label: "Store searches" },
  { href: "/finder", stamp: "Finder", label: "Aisle tickets" },
] as const;

export const CATALOG_BRIEF = {
  href: CATALOG_ROUTE,
  eyebrow: "Fluids book",
  dummy: {
    job: "Search oil, PSI, and filter SKUs by year, make, and model. Then confirm the cap.",
    for: "Anyone who wants the pamphlet, not a licensed factory book.",
    click: "Year / make / model, or a viscosity / SKU scrap.",
    say: "What's on the oil cap and the door jamb for this VIN?",
  },
  genius: {
    job: "216 JSON rows first, then the in-code book, then a labeled heuristic. 90 OEM → Fram / Wix / Purolator rows — not TecDoc.",
    for: "Owners who will not confuse a pamphlet with MOTOR hours.",
    click: "Honda 2003 Accord demo is 5W-20. Tesla Model S / 3 stay not applicable.",
    say: "Quote the viscosity and liters. Do not accept 'whatever we have.'",
  },
} as const;

