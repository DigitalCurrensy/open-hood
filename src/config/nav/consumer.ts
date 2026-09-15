import { CONTACT_NAV_ITEM } from "@/config/nav/contact";
import { FINDER_NAV_ITEM } from "@/config/nav/finder";
import { INTEGRATIONS_NAV_ITEM } from "@/config/nav/integrations";
import { LOG_NAV_ITEM } from "@/config/nav/log";
import { MATRIX_NAV_ITEMS } from "@/config/nav/matrix";
import { RELIABILITY_NAV_ITEM, TRUST_NAV_ITEM, VALUE_NAV_ITEM } from "@/config/nav/trust";
import { NAV_ITEMS, type NavItem } from "@/lib/nav";

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
    label: "Identify",
    blurb: "Type the VIN, or year / make / model.",
  },
  {
    href: "/quote",
    stamp: "Ticket",
    label: "This estimate",
    blurb: "Paste or photograph the repair order.",
  },
  {
    href: "/mechanic-mode",
    stamp: "Script",
    label: "What to say",
    blurb: "Three lines for the service writer.",
  },
  {
    href: "/agent",
    stamp: "Ask",
    label: "Ask",
    blurb: "Ask about oil, a code, or a padded line.",
  },
] as const;

const PRIMARY_HREFS = new Set(CONSUMER_PATH.map((stamp) => stamp.href));

function withNavItem(items: readonly NavItem[], extra: NavItem): NavItem[] {
  return items.some((item) => item.href === extra.href) ? [...items] : [...items, extra];
}

const SCRIPT_NAV_ITEM: NavItem = {
  href: "/mechanic-mode",
  stamp: "Script",
  label: "What to say",
  blurb: "Three lines for the window. Then decide.",
  needsVehicle: false,
};

const SHOPS_MAP_NAV_ITEM: NavItem = {
  href: "/shops",
  stamp: "Maps",
  label: "Find shops",
  blurb: "A Maps search plus the questions to ask. We do not book.",
  needsVehicle: false,
};

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

export const BOARD_NAV: NavItem[] = BAY_NAV.filter((item) => !PRIMARY_HREFS.has(item.href));

export function isCurrentHref(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
