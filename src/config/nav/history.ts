import type { NavItem } from "@/lib/nav";

export const HISTORY_ROUTE = "/history" as const;
export const HISTORY_API_PATH = "/api/history" as const;
export const HISTORY_PLATE_API_PATH = "/api/history/plate" as const;
export const HISTORY_STATUS_API_PATH = "/api/history/status" as const;
export const HISTORY_PHOTO_VIN_HREF = "/" as const;
export const HISTORY_LOG_HREF = "/log" as const;

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS / site-nav. */
export const HISTORY_NAV_ITEM: NavItem = {
  href: HISTORY_ROUTE,
  stamp: "History",
  label: "Identity / history",
  blurb: "NHTSA decode, recalls, complaints, NCAP. VinAudit / CarsXE history only if a key is on. Carfax, AutoCheck, NICB stay link-outs. No fake wrecks.",
  needsVehicle: false,
};

export const HISTORY_INDEX = {
  href: HISTORY_ROUTE,
  stamp: "Jacket",
  label: "Title jacket",
  blurb: "What this bay can prove from NHTSA, and what you still buy from a title report.",
} as const;

export const HISTORY_NEXT_DESKS = [
  { href: "/", stamp: "Bay", label: "Photo the VIN" },
  { href: "/log", stamp: "Log", label: "Stamp a service line" },
  { href: "/recalls", stamp: "Recalls", label: "Campaign English" },
  { href: "/report", stamp: "Findings", label: "Print the customer copy" },
] as const;

/** PageBrief payload — integrator appends this to UX_BRIEFS. */
export const HISTORY_BRIEF = {
  href: HISTORY_ROUTE,
  eyebrow: "Identity jacket",
  dummy: {
    job: "Type the 17. See what this bay knows. Buy a title report if you need wrecks or salvage.",
    for: "Anyone about to buy, sell, or argue a title story.",
    click: "Decode VIN. Plate only works if a commercial key is on.",
    say: "Show me the title brand. A Carfax is not this printout.",
  },
  genius: {
    job: "vPIC identity + SaferCar campaigns/complaints + NCAP. VinAudit / CarsXE history only if VINAUDIT_API_KEY or CARSXE_HISTORY_API_KEY is on — empty + not a Carfax file when off. Owner log merges from openhood.service-log. NMVTIS/Carfax/AutoCheck/NICB stay outbound.",
    for: "Owners who want the live file separated from the paid file.",
    click: "VIN first. Title snapshot only if a history key is on. Plate is a separate decoder.",
    say: "Nameplate campaigns are not VIN open/closed. Salvage is not in NHTSA. Not a Carfax file.",
  },
} as const;
