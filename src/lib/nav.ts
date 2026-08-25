export interface NavItem {
  href: string;
  stamp: string;
  label: string;
  blurb: string;
  needsVehicle: boolean;
}

/** Hardcoded product board — sibling routes may 404 until those agents land. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", stamp: "Home", label: "Identify", blurb: "VIN, photo, or year/make/model. Unlock the bay.", needsVehicle: false },
  { href: "/garage", stamp: "Garage", label: "Garage / specs", blurb: "Oil, coolant, PSI, and filter SKUs on one card.", needsVehicle: true },
  { href: "/quote", stamp: "Quote", label: "Quote defense", blurb: "Photo or paste the RO. We mark the padded lines.", needsVehicle: true },
  { href: "/symptoms", stamp: "Symptoms", label: "Symptom wizard", blurb: "Describe the sound. Get the sentences for the shop.", needsVehicle: true },
  { href: "/recalls", stamp: "Recalls", label: "Recalls", blurb: "NHTSA campaigns in plain English.", needsVehicle: true },
  { href: "/obd", stamp: "OBD", label: "OBD codes", blurb: "Type the code from any $20 scanner.", needsVehicle: false },
  { href: "/parts", stamp: "Parts", label: "Parts", blurb: "Search RockAuto, AutoZone, and Amazon from the SKUs.", needsVehicle: true },
  { href: "/directory", stamp: "Directory", label: "Directory", blurb: "Shop directory — sibling desk.", needsVehicle: false },
  { href: "/auctions", stamp: "Auctions", label: "Auctions", blurb: "Auction / wholesale watch — sibling desk.", needsVehicle: false },
  { href: "/guides", stamp: "Guides", label: "Guides", blurb: "Owner guides — sibling desk.", needsVehicle: false },
  { href: "/agent", stamp: "Agent", label: "Agent", blurb: "Ask the advocate — sibling desk.", needsVehicle: false },
  { href: "/jobs", stamp: "Jobs", label: "Jobs / roles", blurb: "Roles and jobs — sibling desk.", needsVehicle: false },
  { href: "/builds", stamp: "Builds", label: "Build log", blurb: "Kit / swap binder: chassis + engine + trans.", needsVehicle: false },
  { href: "/how-it-works", stamp: "How", label: "How it works", blurb: "What’s free, what we refuse to fake.", needsVehicle: false },
];

export const BAY_TOOLS = NAV_ITEMS.filter((item) => item.href !== "/" && item.href !== "/how-it-works");
