import type { NavItem } from "@/lib/nav";

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS. */
export const AGENT_NAV_ITEM: NavItem = {
  href: "/agent",
  stamp: "Talk",
  label: "Advocate",
  blurb: "A master mechanic in your corner. Ask before you authorize.",
  needsVehicle: false,
};

export const AGENT_ROUTE = "/agent" as const;
