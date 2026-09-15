import type { NavItem } from "@/lib/nav";

/** Stamp for the waiting-room path and the More tools board. */
export const AGENT_NAV_ITEM: NavItem = {
  href: "/agent",
  stamp: "Ask",
  label: "Ask",
  blurb: "Ask about oil, a code, or a padded line. Not a shop booking bot.",
  needsVehicle: false,
};

export const AGENT_ROUTE = "/agent" as const;
