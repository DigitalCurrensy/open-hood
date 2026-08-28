import type { NavItem } from "@/lib/nav";

export const TRUST_ROUTE = "/trust" as const;
export const VALUE_ROUTE = "/value" as const;
export const RELIABILITY_ROUTE = "/reliability" as const;
export const TRUST_API_PATH = "/api/trust" as const;
export const TRUST_HOLD_API_PATH = "/api/trust/hold" as const;

/** Stamp for the bay board. Integrator merges like other sibling desks. */
export const TRUST_NAV_ITEM: NavItem = {
  href: TRUST_ROUTE,
  stamp: "Bond",
  label: "Trust / hold",
  blurb: "Written-estimate checklist, work photos, and a DEMO hold unless Stripe test is on.",
  needsVehicle: false,
};

export const VALUE_NAV_ITEM: NavItem = {
  href: VALUE_ROUTE,
  stamp: "Worth",
  label: "Value band",
  blurb: "Year, miles, condition → a transparent remaining-value band. KBB / Edmunds / NADA are search links.",
  needsVehicle: false,
};

export const RELIABILITY_NAV_ITEM: NavItem = {
  href: RELIABILITY_ROUTE,
  stamp: "File",
  label: "Reliability file",
  blurb: "Complaint counts, not Consumer Reports. SaferCar by component → playbooks. CR is a magazine we do not license.",
  needsVehicle: false,
};

export const TRUST_NAV_ITEMS: NavItem[] = [TRUST_NAV_ITEM, VALUE_NAV_ITEM, RELIABILITY_NAV_ITEM];

export const TRUST_SITEMAP_PATHS = [TRUST_ROUTE, VALUE_ROUTE, RELIABILITY_ROUTE] as const;

export const TRUST_INDEX = {
  href: TRUST_ROUTE,
  stamp: "Bond",
  label: "Bonded-estimate desk",
  blurb: "Checklist + work photos + a hold that is DEMO unless a Stripe test key is on this bay.",
} as const;

export const TRUST_NEXT_DESKS = [
  { href: VALUE_ROUTE, stamp: "Worth", label: "Value band" },
  { href: RELIABILITY_ROUTE, stamp: "File", label: "Reliability file" },
  { href: "/directory", stamp: "Directory", label: "Find a rooftop" },
  { href: "/jobs/claims", stamp: "Claims", label: "Full claim shot list" },
] as const;

export const VALUE_NEXT_DESKS = [
  { href: TRUST_ROUTE, stamp: "Bond", label: "Trust / hold" },
  { href: RELIABILITY_ROUTE, stamp: "File", label: "Reliability file" },
  { href: "/auctions", stamp: "Auctions", label: "Lane fees" },
] as const;

export const RELIABILITY_NEXT_DESKS = [
  { href: TRUST_ROUTE, stamp: "Bond", label: "Trust / hold" },
  { href: VALUE_ROUTE, stamp: "Worth", label: "Value band" },
  { href: "/history", stamp: "Jacket", label: "Not a Carfax file" },
  { href: "/expert/complaint-pile", stamp: "Pile", label: "Component map" },
  { href: "/recalls", stamp: "Recalls", label: "NHTSA campaigns" },
  { href: "/expert/tsb", stamp: "Patterns", label: "Failure patterns" },
] as const;

export const TRUST_BRIEF = {
  href: TRUST_ROUTE,
  eyebrow: "Bond · hold · FNOL",
  dummy: {
    job: "Tick the written estimate. Shoot the finished work. A hold here is play money unless this bay says Stripe test.",
    for: "Anyone about to authorize a job — or file a claim after a hit.",
    click: "Checklist, then the camera, then Stamp a hold. Carrier buttons open their claim desks.",
    say: "Show me the written estimate, the bond or license on the ticket, and the old part.",
  },
  genius: {
    job: "No surety bond, no escrow, no shop payout. Missing STRIPE_SECRET_KEY → DEMO stamp. sk_test_ → PaymentIntent, capture_method=manual, not captured. sk_live_ is refused.",
    for: "Owners who want paper and photos, not a marketplace hold.",
    click: "Hold amount is documented ($1–$500). FNOL list + State Farm / GEICO / Progressive. AAA is a locator link-out.",
    say: "Authorization ceiling in dollars. Call before extras. I want the old part in a photo.",
  },
} as const;

export const VALUE_BRIEF = {
  href: VALUE_ROUTE,
  eyebrow: "Book value · illustration",
  dummy: {
    job: "Year, make, model, miles, and condition. Read the remaining-value band. Then open KBB, Edmunds, or NADA.",
    for: "Anyone pricing a keeper, a sale, or a repair-vs-walk decision.",
    click: "Fill the card. Read the math. Open a book site.",
    say: "What is your number for this year, these miles, this condition?",
  },
  genius: {
    job: "Transparent keep-rate: first year 20% off, then 10% of remaining per year, miles vs 12k/yr, condition factor, ±8 point band. Not a Cox residual unless we fetched one.",
    for: "Owners who will not treat a painted dollar as a feed.",
    click: "Optional known price turns the band into dollars. KBB_API_KEY only changes the label — we still do not invent a Cox number.",
    say: "Here is our illustration. What does your book say for this VIN and these options?",
  },
} as const;

export const RELIABILITY_BRIEF = {
  href: RELIABILITY_ROUTE,
  eyebrow: "SaferCar file · not CR",
  dummy: {
    job: "Complaint counts, not Consumer Reports. See who already filed on this nameplate, by part.",
    for: "Anyone asking “is this car a headache?” before they keep spending.",
    click: "Year / make / model. Read the file. Open the playbook on that component.",
    say: "How many complaints are on this year-make-model, and for what part?",
  },
  genius: {
    job: "ODI complaintsByVehicle, counted by component, linked to playbooks. Not a Consumer Reports survey. CR is a magazine we do not license.",
    for: "Owners who want the public file plus a local panel, not a magazine badge.",
    click: "Pull SaferCar. Follow the component → playbook stamp. Vote is n of this phone, not CR’s panel.",
    say: "Complaint counts, not Consumer Reports. It is not a failure rate per 100 cars.",
  },
} as const;

export const TRUST_BRIEFS = [TRUST_BRIEF, VALUE_BRIEF, RELIABILITY_BRIEF] as const;
