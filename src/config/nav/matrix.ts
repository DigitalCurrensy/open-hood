import { AGENT_NAV_ITEM } from "@/config/nav/agent";
import { BOOK_NAV_ITEM } from "@/config/nav/book";
import { CATALOG_NAV_ITEM } from "@/config/nav/catalog";
import { CONTACT_NAV_ITEM } from "@/config/nav/contact";
import { navItems as directoryNavRows } from "@/config/nav/directory";
import { ESTIMATE_NAV_ITEM } from "@/config/nav/estimate";
import { EXPERT_NAV_ITEM } from "@/config/nav/expert";
import { FINDER_NAV_ITEM } from "@/config/nav/finder";
import { HISTORY_NAV_ITEM } from "@/config/nav/history";
import { GUIDES_NAV } from "@/config/nav/guides";
import { INTEGRATIONS_NAV_ITEM } from "@/config/nav/integrations";
import { JOB_INDEX } from "@/config/nav/jobs";
import { LOG_NAV_ITEM } from "@/config/nav/log";
import { REPORT_NAV } from "@/config/nav/report";
import { SCAN_NAV_ITEM } from "@/config/nav/scan";
import { STICKER_NAV_ITEM } from "@/config/nav/sticker";
import { RELIABILITY_NAV_ITEM, TRUST_NAV_ITEM, VALUE_NAV_ITEM } from "@/config/nav/trust";
import type { NavItem } from "@/lib/nav";

/**
 * Competitor-matrix stamps. Import a sibling `*_NAV_ITEM` when that file exists.
 * If the desk file is not on disk yet, keep the href — E2E siblings may land the route.
 */

function item(
  href: string,
  stamp: string,
  label: string,
  blurb: string,
  needsVehicle = false,
): NavItem {
  return { href, stamp, label, blurb, needsVehicle };
}

const directoryHref = directoryNavRows.find((row) => row.href === "/directory")?.href ?? "/directory";

export { BOOK_NAV_ITEM, CATALOG_NAV_ITEM, ESTIMATE_NAV_ITEM, FINDER_NAV_ITEM, HISTORY_NAV_ITEM, SCAN_NAV_ITEM, STICKER_NAV_ITEM };
export { RELIABILITY_NAV_ITEM, TRUST_NAV_ITEM, VALUE_NAV_ITEM };

export const DIRECTORY_NAV_ITEM: NavItem = item(
  directoryHref,
  "Directory",
  "Directory",
  "OSM rooftops near a ZIP. We do not book a bay.",
);

export const AUCTIONS_NAV_ITEM: NavItem = item(
  "/auctions",
  "Auctions",
  "Auction lanes",
  "Public and wholesale link-outs. We do not scrape Manheim or Copart lots.",
);

export const JOBS_NAV_ITEM: NavItem = {
  href: JOB_INDEX.href,
  stamp: JOB_INDEX.stamp,
  label: JOB_INDEX.label,
  blurb: JOB_INDEX.blurb,
  needsVehicle: false,
};

export const REPORT_NAV_ITEM: NavItem = {
  href: REPORT_NAV.href,
  stamp: REPORT_NAV.stamp,
  label: REPORT_NAV.label,
  blurb: "Customer copy: vehicle, quote flags, and the window script. Print or download the packet.",
  needsVehicle: false,
};

/**
 * Board extras in the order the 200% matrix asked for. Deduped by href in `config/nav/consumer`.
 * The three primary moves (Car / Ticket / Shops) live in `CONSUMER_PATH`, not here.
 */
export const MATRIX_NAV_ITEMS: NavItem[] = [
  ESTIMATE_NAV_ITEM,
  HISTORY_NAV_ITEM,
  STICKER_NAV_ITEM,
  CATALOG_NAV_ITEM,
  BOOK_NAV_ITEM,
  FINDER_NAV_ITEM,
  SCAN_NAV_ITEM,
  TRUST_NAV_ITEM,
  VALUE_NAV_ITEM,
  RELIABILITY_NAV_ITEM,
  CONTACT_NAV_ITEM,
  REPORT_NAV_ITEM,
  LOG_NAV_ITEM,
  EXPERT_NAV_ITEM,
  INTEGRATIONS_NAV_ITEM,
  DIRECTORY_NAV_ITEM,
  AUCTIONS_NAV_ITEM,
  GUIDES_NAV,
  AGENT_NAV_ITEM,
  JOBS_NAV_ITEM,
];

export const MATRIX_STAMPS = MATRIX_NAV_ITEMS.map((row) => ({
  href: row.href,
  stamp: row.stamp,
})) as readonly { href: string; stamp: string }[];
