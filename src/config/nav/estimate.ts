import type { NavItem } from "@/lib/nav";
import { ESTIMATE_API_PATH, ESTIMATE_ROUTE, LABOR_DISCLAIMER } from "@/lib/labor/types";

/** Stamp for the bay board. Integrator merges this into site-nav like CONTACT_NAV_ITEM. */
export const ESTIMATE_NAV_ITEM: NavItem = {
  href: ESTIMATE_ROUTE,
  stamp: "Estimate",
  label: "Estimate + ZIP labor",
  blurb: "Job + ZIP. Parts and labor band. Not a Motor guide.",
  needsVehicle: false,
};

export const ESTIMATE_INDEX = {
  href: ESTIMATE_ROUTE,
  stamp: "Ticket",
  label: "Estimate + ZIP labor",
  blurb: "One number for the window. Hours × rate when you switch to Expert.",
} as const;

export const ESTIMATE_NEXT_DESKS = [
  { href: "/quote", stamp: "Quote", label: "Markup the RO they handed you" },
  { href: "/directory", stamp: "Directory", label: "Find a rooftop in this ZIP" },
  { href: "/mechanic-mode", stamp: "Script", label: "Three lines for the window" },
] as const;

/** PageBrief payload — integrator appends this to UX_BRIEFS. */
export const ESTIMATE_BRIEF = {
  href: ESTIMATE_ROUTE,
  eyebrow: "Estimate",
  dummy: {
    job: "Pick the job. Type the ZIP. Walk in with one dollar range.",
    for: "Anyone holding a verbal or written quote.",
    click: "ZIP + a job stamp. Then read the yellow number.",
    say: "Your independent band for this ZIP is [range]. Write hours and the door rate.",
  },
  genius: {
    job: "ZIP3 → rural / midwest / sunbelt / mountain / coast. Indie $/hr × book hours. Dealer is the indie band times that region’s multiplier. Not a licensed Motor guide.",
    for: "Owners who will ask for hours × the posted door rate.",
    click: "Year/make tighten parts. Paste their number to compare.",
    say: "Hours × posted rate. Rotors in millimeters. Call before extras.",
  },
} as const;

export { ESTIMATE_API_PATH, ESTIMATE_ROUTE, LABOR_DISCLAIMER };
