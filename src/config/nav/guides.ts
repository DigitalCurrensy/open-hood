import type { NavItem } from "@/lib/nav";

/** Stamp for the how-to bay. Import this into the shell nav when that desk is ready. */
export const GUIDES_NAV: NavItem = {
  href: "/guides",
  stamp: "How-to",
  label: "How-to glossary",
  blurb: "How-to bay, next generation — real jobs mapped to real videos.",
  needsVehicle: false,
};

export const GUIDE_JOB_FAMILIES = [
  { id: "fluids", stamp: "Fluids", label: "Oil, coolant, brake, trans" },
  { id: "filters", stamp: "Filters", label: "Cabin, air, fuel" },
  { id: "brakes", stamp: "Brakes", label: "Pads, rotors, bleed" },
  { id: "tires", stamp: "Tires", label: "PSI, rotate, spare, TPMS" },
  { id: "battery", stamp: "Battery", label: "Jump, test, alternator" },
  { id: "obd", stamp: "OBD", label: "Read a $20 code" },
  { id: "lights", stamp: "Lights", label: "Headlights and blinkers" },
  { id: "wipers", stamp: "Wipers", label: "Blades you can swap" },
  { id: "ignition", stamp: "Spark", label: "Plugs and coils" },
  { id: "jacking", stamp: "Jack", label: "Points and stands" },
  { id: "buying-used", stamp: "Used", label: "PPI and what to film" },
  { id: "shop-talk", stamp: "Counter", label: "Talking to the shop" },
  { id: "ev", stamp: "EV", label: "No oil, 12V, tires" },
] as const;

export const GUIDE_PART_ALIASES: Record<string, string[]> = {
  "cabin-filter": ["cabin-filter"],
  "engine-air-filter": ["engine-air-filter"],
  "oil-filter": ["oil-filter", "engine-oil"],
  "fuel-filter": ["fuel-filter"],
  "brake-pads": ["brake-pads", "rotors"],
  rotors: ["rotors", "brake-pads"],
  "brake-fluid": ["brake-fluid"],
  coolant: ["coolant"],
  "transmission-fluid": ["transmission-fluid"],
  "engine-oil": ["engine-oil", "oil-filter"],
  battery: ["battery", "12v-battery"],
  "12v-battery": ["12v-battery", "battery"],
  alternator: ["alternator"],
  "spark-plugs": ["spark-plugs"],
  "ignition-coils": ["ignition-coils", "spark-plugs"],
  "wiper-blades": ["wiper-blades"],
  "headlight-bulb": ["headlight-bulb"],
  "turn-signal": ["turn-signal", "headlight-bulb"],
  tires: ["tires", "tpms"],
  tpms: ["tpms", "tires"],
  jack: ["jack"],
  "obd-scanner": ["obd-scanner"],
};
