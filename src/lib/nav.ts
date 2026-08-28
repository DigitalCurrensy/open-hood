import { AGENT_NAV_ITEM } from "@/config/nav/agent";
import { CATALOG_NAV_ITEM } from "@/config/nav/catalog";
import { EXPERT_NAV_ITEM } from "@/config/nav/expert";
import { LOG_NAV_ITEM } from "@/config/nav/log";
import { STICKER_NAV_ITEM } from "@/config/nav/sticker";

export interface NavItem {
  href: string;
  stamp: string;
  label: string;
  blurb: string;
  needsVehicle: boolean;
}

/**
 * Core product board. The header prints Car / Ticket / Shops, then every other stamp
 * under an open “More bays” disclosure (see `@/config/nav/consumer`).
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", stamp: "Home", label: "Identify", blurb: "VIN, photo, or year/make/model. Unlock the bay.", needsVehicle: false },
  STICKER_NAV_ITEM,
  { href: "/garage", stamp: "Garage", label: "Garage / specs", blurb: "Oil, coolant, PSI, and filter SKUs on one card.", needsVehicle: true },
  CATALOG_NAV_ITEM,
  { href: "/quote", stamp: "Quote", label: "Quote defense", blurb: "Photo or paste the RO. We mark the padded lines.", needsVehicle: true },
  { href: "/symptoms", stamp: "Symptoms", label: "Symptom wizard", blurb: "Describe the sound. Get the sentences for the shop.", needsVehicle: true },
  { href: "/recalls", stamp: "Recalls", label: "Recalls", blurb: "NHTSA campaigns in plain English.", needsVehicle: true },
  { href: "/obd", stamp: "OBD", label: "OBD codes", blurb: "Android BLE ELM327 or type the code. iPhone types.", needsVehicle: false },
  { href: "/parts", stamp: "Parts", label: "Parts", blurb: "Search RockAuto, AutoZone, and Amazon from the SKUs.", needsVehicle: true },
  { href: "/directory", stamp: "Directory", label: "Directory", blurb: "Rooftops near a ZIP. We do not book a bay.", needsVehicle: false },
  { href: "/auctions", stamp: "Auctions", label: "Auctions", blurb: "Auction / wholesale watch — sibling desk.", needsVehicle: false },
  { href: "/guides", stamp: "Guides", label: "Guides", blurb: "Owner guides — sibling desk.", needsVehicle: false },
  AGENT_NAV_ITEM,
  EXPERT_NAV_ITEM,
  { href: "/jobs", stamp: "Jobs", label: "Jobs / roles", blurb: "Roles and jobs — sibling desk.", needsVehicle: false },
  { href: "/builds", stamp: "Builds", label: "Build log", blurb: "Kit / swap binder: chassis + engine + trans.", needsVehicle: false },
  LOG_NAV_ITEM,
  { href: "/how-it-works", stamp: "How", label: "How it works", blurb: "What’s free, what we refuse to fake.", needsVehicle: false },
];

export const BAY_TOOLS = NAV_ITEMS.filter((item) => item.href !== "/" && item.href !== "/how-it-works");
