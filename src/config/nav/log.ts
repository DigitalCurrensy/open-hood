import type { NavItem } from "@/lib/nav";
import {
  SERVICE_LOG_PRINTOUT_HREF,
  SERVICE_LOG_ROUTE,
  SERVICE_LOG_STORAGE_KEY,
} from "@/lib/service-log/types";

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS. */
export const LOG_NAV_ITEM: NavItem = {
  href: SERVICE_LOG_ROUTE,
  stamp: "Log",
  label: "Service log",
  blurb: "Date, miles, what was done. On this device. Open Findings for the printout.",
  needsVehicle: false,
};

export const LOG_ROUTE = SERVICE_LOG_ROUTE;
export const LOG_STORAGE_KEY = SERVICE_LOG_STORAGE_KEY;
export const LOG_PRINTOUT_HREF = SERVICE_LOG_PRINTOUT_HREF;

export const LOG_INDEX = {
  href: SERVICE_LOG_ROUTE,
  stamp: "Book",
  label: "Owner service log",
  blurb: "A dated notebook the shop does not own. Beginner is three fields. Expert adds the RO and SKUs.",
} as const;
