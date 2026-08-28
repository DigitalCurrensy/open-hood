import type { NavItem } from "@/lib/nav";

export const BOOK_ROUTE = "/book" as const;
export const BOOK_API_PATH = "/api/book" as const;
export const BOOK_STORAGE_KEY = "openhood.book-requests";
export const BOOK_STORAGE_EVENT = "openhood:book-requests";

/** Stamp for the bay board. Integrator merges this into site-nav like other sibling desks. */
export const BOOK_NAV_ITEM: NavItem = {
  href: BOOK_ROUTE,
  stamp: "Visit",
  label: "Get the work done",
  blurb: "Request a visit. We send your request; we don't send a mechanic.",
  needsVehicle: false,
};

export const BOOK_INDEX = {
  href: BOOK_ROUTE,
  stamp: "Intake",
  label: "Get the work done",
  blurb: "Job, ZIP, vehicle, window. Shop, mobile, or dealer. We do not employ techs.",
} as const;

export const BOOK_NEXT_DESKS = [
  { href: "/directory", stamp: "Directory", label: "Call a rooftop" },
  { href: "/quote", stamp: "Quote", label: "Mark the estimate" },
  { href: "/contact", stamp: "Window", label: "Send the RO" },
] as const;

/** PageBrief payload — integrator appends this to UX_BRIEFS. */
export const BOOK_BRIEF = {
  href: BOOK_ROUTE,
  eyebrow: "Intake · not a dispatch",
  dummy: {
    job: "Write the job, the ZIP, the car, and a window. We send the request. We do not send a mechanic.",
    for: "Owners who need a visit, not a marketplace van.",
    click: "Fill the carbon. Send the request.",
    say: "Here is the job and the ZIP. Who actually turns the wrench?",
  },
  genius: {
    job: "Venue is shop / mobile / dealer. Shop shortlist is OSM via /api/directory/search — or /directory/{zip} if that line is missing. Dealer links are OEM locators. Status lives on this phone. We do not dispatch.",
    for: "Anyone comparing us to YourMechanic, Wrench, RepairSmith, or a dealer app.",
    click: "ZIP + venue. Shop cards or OEM URLs. The board says sent, never dispatched.",
    say: "Open Hood does not employ technicians. This is a visit note and a shortlist — not a checkout.",
  },
} as const;
