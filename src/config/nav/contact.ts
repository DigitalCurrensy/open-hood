import type { NavItem } from "@/lib/nav";

export const CONTACT_ROUTE = "/contact" as const;
export const CONTACT_API_PATH = "/api/contact" as const;

/** Stamp for the bay board. Merge in site-nav like other sibling desks. */
export const CONTACT_NAV_ITEM: NavItem = {
  href: CONTACT_ROUTE,
  stamp: "RO",
  label: "Talk to Open Hood",
  blurb: "Send the RO. Name, a number, and the ticket. We do not sell it.",
  needsVehicle: false,
};

export const CONTACT_INDEX = {
  href: CONTACT_ROUTE,
  stamp: "Window",
  label: "Talk to Open Hood",
  blurb: "Slide the estimate under the glass. We read it. We do not book a shop.",
} as const;

export const CONTACT_NEXT_DESKS = [
  { href: "/report", stamp: "Findings", label: "Print the customer copy" },
  { href: "/agent", stamp: "Advocate", label: "Ask the desk" },
  { href: "/directory", stamp: "Directory", label: "Find a rooftop" },
] as const;

/** PageBrief payload — integrator appends this to UX_BRIEFS. */
export const CONTACT_BRIEF = {
  href: CONTACT_ROUTE,
  eyebrow: "The RO window",
  dummy: {
    job: "Name, a phone or email, and the ticket. Send the RO.",
    for: "Anyone with a quote, a noise, or a campaign question.",
    click: "Fill the carbon. Send the RO.",
    say: "Here is the estimate. Which lines are padded?",
  },
  genius: {
    job: "Role, VIN, YMM, miles, callback window. JPEG of the RO compresses on the phone. No mailer key means a local ticket you print — we do not pretend it emailed a team.",
    for: "Owners, DIY, shops, dealers, fleet, press.",
    click: "VIN + need + paste or photo. Consent is required.",
    say: "Campaign id / rotor mm / out-the-door. Not adjectives.",
  },
} as const;
