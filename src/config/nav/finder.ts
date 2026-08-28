import type { NavItem } from "@/lib/nav";
import { FEATURED_SLUGS, FINDER_JOB_COUNT, jobSlugs } from "@/lib/finder/jobs";

/** Stamp for the bay board. Integrator merges this into NAV_ITEMS. */
export const FINDER_NAV_ITEM: NavItem = {
  href: "/finder",
  stamp: "Finder",
  label: "Fix Finder",
  blurb: "Code or symptom → likely jobs → parts aisle. Search URLs, not shelf count.",
  needsVehicle: false,
};

export const FINDER_INDEX = {
  href: "/finder",
  stamp: "Aisle",
  label: "Fix Finder",
  blurb: "Type a scanner code or a symptom. We name the jobs, then the boxes — and we hold the ones you should not throw.",
} as const;

export const FINDER_FEATURED = [
  { href: "/finder?code=P0420", stamp: "P0420", label: "Catalyst — diagnose first", blurb: "Do not throw the converter." },
  { href: "/finder?q=cabin+filter", stamp: "Cabin", label: "Cabin air filter", blurb: "Glove-box clip job." },
  { href: "/finder?q=brake+pads", stamp: "Pads", label: "Brake pads", blurb: "Millimeters, not adjectives." },
  { href: "/finder?q=battery", stamp: "12V", label: "Battery", blurb: "Group size, not “a car battery.”" },
  { href: "/finder?code=P0300", stamp: "P0300", label: "Misfire pattern", blurb: "Not a coil four-pack." },
  { href: "/finder?q=oil+change", stamp: "Oil", label: "Oil and filter", blurb: "Viscosity first." },
] as const;

export const FINDER_NAV = [FINDER_INDEX, ...FINDER_FEATURED] as const;

export const FINDER_ROUTES = [
  "/finder",
  ...jobSlugs().map((slug) => `/finder/${slug}`),
  "/finder?code=P0420",
  "/finder?q=cabin+filter",
  "/api/finder",
  "/api/finder/jobs",
  "/api/finder/links",
  "/api/finder/status",
] as const;

export const FINDER_BRIEF = {
  href: "/finder",
  eyebrow: "Fix Finder",
  dummy: {
    job: "Type the scanner code or the symptom. We name the likely jobs, then the boxes on the hook.",
    for: "Anyone standing at a parts counter — or about to.",
    click: "Code or symptom. Open a store search for the part on this car.",
    say: "What will you ask me — engine, 2WD or 4WD — before you pull the box?",
  },
  genius: {
    job: `${FINDER_JOB_COUNT} aisle tickets. P0420 holds the converter. Search URLs only — no TecDoc SKUs, no shelf count.`,
    for: "Owners who want the counter questions before they buy the wrong box.",
    click: "YMM from the bay ticket. HOLD stamps stay on diagnose-first parts.",
    say: "Graph both O2 sensors before anyone prices a brick.",
  },
};

export const FINDER_FEATURED_SLUGS = FEATURED_SLUGS;
