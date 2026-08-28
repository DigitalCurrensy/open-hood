import { CONTACT_NAV_ITEM } from "@/config/nav/contact";
import { FINDER_NAV_ITEM } from "@/config/nav/finder";
import { INTEGRATIONS_NAV_ITEM } from "@/config/nav/integrations";
import { LOG_NAV_ITEM } from "@/config/nav/log";
import { MATRIX_NAV_ITEMS } from "@/config/nav/matrix";
import { RELIABILITY_NAV_ITEM, TRUST_NAV_ITEM, VALUE_NAV_ITEM } from "@/config/nav/trust";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";

/**
 * Phone path. Three moves, in order: the car, the ticket, the rooftop.
 * The rest of the board stays on disclosure so no route is deleted.
 */
export interface ConsumerStamp {
  href: string;
  stamp: string;
  label: string;
  blurb: string;
}

export const CONSUMER_PATH: readonly ConsumerStamp[] = [
  {
    href: "/",
    stamp: "Car",
    label: "Identify the car",
    blurb: "VIN, or year / make / model.",
  },
  {
    href: "/quote",
    stamp: "Ticket",
    label: "Mark this RO",
    blurb: "Paste the estimate. We mark the padded lines.",
  },
  {
    href: "/directory",
    stamp: "Shops",
    label: "Find a rooftop",
    blurb: "Shops near a ZIP. We do not book a bay.",
  },
] as const;

const PRIMARY_HREFS = new Set(CONSUMER_PATH.map((stamp) => stamp.href));

function withNavItem(items: readonly NavItem[], extra: NavItem): NavItem[] {
  return items.some((item) => item.href === extra.href) ? [...items] : [...items, extra];
}

const SCRIPT_NAV_ITEM: NavItem = {
  href: "/mechanic-mode",
  stamp: "Script",
  label: "Counter script",
  blurb: "Three lines for the window. Then decide.",
  needsVehicle: false,
};

const SHOPS_MAP_NAV_ITEM: NavItem = {
  href: "/shops",
  stamp: "Maps",
  label: "Find shops",
  blurb: "A Maps search plus the questions to ask. We do not book a bay.",
  needsVehicle: false,
};

/** Every stamp Open Hood ships, deduped by href. */
export const BAY_NAV: NavItem[] = [
  ...MATRIX_NAV_ITEMS,
  TRUST_NAV_ITEM,
  VALUE_NAV_ITEM,
  RELIABILITY_NAV_ITEM,
  FINDER_NAV_ITEM,
  SCRIPT_NAV_ITEM,
  SHOPS_MAP_NAV_ITEM,
].reduce(
  (items, extra) => withNavItem(items, extra),
  withNavItem(withNavItem(withNavItem(NAV_ITEMS, INTEGRATIONS_NAV_ITEM), LOG_NAV_ITEM), CONTACT_NAV_ITEM),
);

/** The board behind "More bays" — the three primary moves already have stamps. */
export const BOARD_NAV: NavItem[] = BAY_NAV.filter((item) => !PRIMARY_HREFS.has(item.href));

export function isCurrentHref(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
