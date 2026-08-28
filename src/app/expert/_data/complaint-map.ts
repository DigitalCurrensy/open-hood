/**
 * SaferCar component field → playbooks / quote job slugs / pattern cards.
 * Labeled mapping. Not Consumer Reports. Not a failure rate.
 */

export type ComplaintLinkKind = "playbook" | "quote" | "pattern";

export interface ComplaintDeskLink {
  href: string;
  stamp: string;
  label: string;
  kind: ComplaintLinkKind;
  why: string;
}

export interface ComplaintPatternCard {
  component: string;
  bucket: string;
  playbookSlugs: string[];
  quoteSlugs: Array<{ slug: string; stamp: string; label: string }>;
  patternIds: string[];
  why: string;
}

const PLAYBOOK_STAMP: Record<string, string> = {
  "oil-spec": "Oil",
  "coolant-spec": "Coolant",
  "trans-flush": "Flush",
  "tire-sticker": "PSI",
  misfire: "P0300",
  "check-engine": "CEL",
  "brake-noise": "Brakes",
  "recall-first": "Recall",
  "history-jacket": "Jacket",
  "used-ppi": "PPI",
  "frame-rust": "Frame",
  "ev-12v": "12V",
  "ev-owner": "EV",
  "pre-shop": "Pre-shop",
  "after-quote": "Quote",
  "cabin-upsell": "Cabin",
  "interval-card": "Interval",
  "complaint-pile": "Pile",
};

function playbookLink(slug: string): ComplaintDeskLink {
  return {
    href: `/expert/${slug}`,
    stamp: PLAYBOOK_STAMP[slug] ?? "Playbook",
    label: slug,
    kind: "playbook",
    why: "Owner script for this SaferCar bucket. Pattern card, not CR.",
  };
}

function quoteLink(slug: string, stamp: string, label: string): ComplaintDeskLink {
  return {
    href: `/quote?job=${encodeURIComponent(slug)}`,
    stamp,
    label,
    kind: "quote",
    why: "Quote-desk job slug. Mark the line. Not a price we invented.",
  };
}

function patternLink(id: string, stamp: string): ComplaintDeskLink {
  return {
    href: `/expert/tsb#${id}`,
    stamp,
    label: id,
    kind: "pattern",
    why: "Public pattern card. Not a stolen TSB PDF.",
  };
}

const BUCKETS: Array<{
  id: string;
  match: RegExp;
  playbooks: string[];
  quotes: Array<{ slug: string; stamp: string; label: string }>;
  patterns: string[];
  why: string;
}> = [
  {
    id: "airbags",
    match: /\bair ?bags?\b|\binflator\b|\bsrs\b/,
    playbooks: ["recall-first", "used-ppi", "history-jacket"],
    quotes: [{ slug: "inspection", stamp: "Insp", label: "Inspection" }],
    patterns: ["takata-family", "takata-accord-2003"],
    why: "Inflator / SRS filings. VIN on SaferCar. Not a yard bag.",
  },
  {
    id: "powertrain",
    match: /\bpower ?train\b|\btransmission\b|\bcvt\b|\btcm\b|\bclutch\b|\bdriveline\b/,
    playbooks: ["trans-flush", "after-quote", "used-ppi"],
    quotes: [{ slug: "trans-service", stamp: "ATF", label: "Trans service" }],
    patterns: [
      "honda-cvt-start-clutch",
      "honda-accord-trans-03",
      "nissan-cvt-judder",
      "ford-dps6",
      "ford-10r80",
      "jeep-9speed",
    ],
    why: "Shift / CVT / TCM pile. Fluid name first. Not a Dexron special.",
  },
  {
    id: "cooling",
    match: /\bcooling system\b|\bcoolant\b|\bradiator\b|\bthermostat\b|\bwater.?pump\b/,
    playbooks: ["coolant-spec", "after-quote", "interval-card"],
    quotes: [
      { slug: "coolant", stamp: "Cool", label: "Coolant" },
      { slug: "radiator", stamp: "Rad", label: "Radiator" },
      { slug: "thermostat", stamp: "Stat", label: "Thermostat" },
      { slug: "water-pump", stamp: "Pump", label: "Water pump" },
    ],
    patterns: ["ford-ecoboost-coolant", "gm-dexcool-intake", "toyota-hybrid-inverter"],
    why: "Chemistry and a leak test. Color is not a spec.",
  },
  {
    id: "engine",
    match: /\bengine\b|\bmisfire\b|\boil\b|\bp030/,
    playbooks: ["oil-spec", "misfire", "check-engine", "interval-card"],
    quotes: [
      { slug: "oil", stamp: "Oil", label: "Oil change" },
      { slug: "plugs", stamp: "Plugs", label: "Spark plugs" },
      { slug: "ignition-coil", stamp: "Coil", label: "Ignition coil" },
    ],
    patterns: [
      "honda-15t-dilution",
      "honda-j35-vcm",
      "honda-vtc-rattle",
      "toyota-2az-consumption",
      "gm-afm-lifter",
      "ford-coil-on-plug",
      "ford-54-spark-plug",
      "nissan-qr25-oil",
      "subaru-fb-oil",
      "hyundai-theta",
    ],
    why: "Counts and the cap. Not a four-pack from the code title.",
  },
  {
    id: "fuel",
    match: /\bfuel\b|\bpropulsion\b|\bevap\b|\bpump\b/,
    playbooks: ["check-engine", "pre-shop"],
    quotes: [
      { slug: "fuel-pump", stamp: "Pump", label: "Fuel pump" },
      { slug: "evap", stamp: "EVAP", label: "EVAP" },
      { slug: "fuel-filter", stamp: "Filter", label: "Fuel filter" },
    ],
    patterns: ["p0420-cat-efficiency", "hyundai-theta"],
    why: "Fuel / EVAP filings. Freeze-frame before a pump.",
  },
  {
    id: "brakes",
    match: /\bbrake/,
    playbooks: ["brake-noise", "pre-shop", "interval-card"],
    quotes: [
      { slug: "pads", stamp: "Pads", label: "Pads" },
      { slug: "rotors", stamp: "Rotors", label: "Rotors" },
      { slug: "brake-fluid", stamp: "DOT", label: "Brake fluid" },
      { slug: "calipers", stamp: "Cal", label: "Calipers" },
    ],
    patterns: ["brake-indicator-squeal"],
    why: "Millimeters and a test strip. “Due” is not a reading.",
  },
  {
    id: "tires",
    match: /\btire|\btyre|\bwheel|\btpms\b/,
    playbooks: ["tire-sticker", "pre-shop"],
    quotes: [
      { slug: "tire-rotate", stamp: "Rotate", label: "Rotate" },
      { slug: "alignment", stamp: "Align", label: "Alignment" },
      { slug: "hub-bearing", stamp: "Hub", label: "Hub bearing" },
    ],
    patterns: [],
    why: "Door sticker owns PSI. Sidewall max is not the target.",
  },
  {
    id: "steering",
    match: /\bsteering\b|\brack\b|\btie.?rod\b/,
    playbooks: ["pre-shop", "after-quote"],
    quotes: [
      { slug: "alignment", stamp: "Align", label: "Alignment" },
      { slug: "tie-rod", stamp: "Tie", label: "Tie rod" },
    ],
    patterns: [],
    why: "Play and a measurement. Not a menu alignment.",
  },
  {
    id: "suspension",
    match: /\bsuspension\b|\bstrut\b|\bshock\b|\bcontrol.?arm\b/,
    playbooks: ["pre-shop", "used-ppi"],
    quotes: [
      { slug: "strut", stamp: "Strut", label: "Strut" },
      { slug: "shock", stamp: "Shock", label: "Shock" },
      { slug: "control-arm", stamp: "Arm", label: "Control arm" },
    ],
    patterns: [],
    why: "Photo the torn boot. A thump is not a four-corner package.",
  },
  {
    id: "electrical",
    match: /\belectrical\b|\b12v\b|\b24v\b|\bbattery\b|\balternator\b|\binstrument\b/,
    playbooks: ["ev-12v", "check-engine", "pre-shop"],
    quotes: [
      { slug: "battery", stamp: "12V", label: "Battery" },
      { slug: "alternator", stamp: "Alt", label: "Alternator" },
      { slug: "starter", stamp: "Start", label: "Starter" },
    ],
    patterns: ["ev-12v-silent", "tesla-lv-battery", "chrysler-tipm", "gm-ignition-switch"],
    why: "Rested voltage first. A silent EV is often the 12V.",
  },
  {
    id: "hybrid",
    match: /\bhybrid\b|\binverter\b|\bhigh.?voltage\b|\btraction.?battery\b/,
    playbooks: ["ev-12v", "ev-owner", "coolant-spec"],
    quotes: [{ slug: "battery", stamp: "12V", label: "12V battery" }],
    patterns: ["toyota-hybrid-inverter", "tesla-lv-battery", "ev-12v-silent"],
    why: "Two coolant loops and a 12V. A pack quote from a dark screen is a pause.",
  },
  {
    id: "structure",
    match: /\bstructure\b|\bframe\b|\bbody\b|\brust\b|\bcorrosion\b/,
    playbooks: ["frame-rust", "used-ppi", "history-jacket"],
    quotes: [{ slug: "inspection", stamp: "Insp", label: "Inspection" }],
    patterns: ["toyota-frame-rust"],
    why: "Lift photos. A consumer Carfax is a link-out we do not own.",
  },
  {
    id: "visibility",
    match: /\bvisibility\b|\bwiper\b|\bwindow\b|\bdefrost\b/,
    playbooks: ["pre-shop"],
    quotes: [
      { slug: "wiper", stamp: "Wipe", label: "Wipers" },
      { slug: "window-regulator", stamp: "Reg", label: "Window regulator" },
    ],
    patterns: [],
    why: "See it fail once. A four-motor quote from one window is a pause.",
  },
  {
    id: "lighting",
    match: /\blighting\b|\bheadlamp\b|\bbulb\b/,
    playbooks: ["pre-shop"],
    quotes: [{ slug: "bulb", stamp: "Bulb", label: "Bulb" }],
    patterns: [],
    why: "One side first. A four-lamp LED package from one outage is a menu.",
  },
  {
    id: "restraints",
    match: /\bseat.?belt|\bseats?\b|\blatch/,
    playbooks: ["recall-first", "used-ppi"],
    quotes: [{ slug: "inspection", stamp: "Insp", label: "Inspection" }],
    patterns: ["takata-family"],
    why: "Campaign first. Do not buy a used belt or bag.",
  },
  {
    id: "stability",
    match: /\btraction\b|\bstability\b|\besc\b|\bspeed control\b|\bcruise\b/,
    playbooks: ["check-engine", "pre-shop"],
    quotes: [{ slug: "inspection", stamp: "Insp", label: "Inspection" }],
    patterns: [],
    why: "Module codes and a battery number. Not a four-sensor package from a lamp.",
  },
  {
    id: "hvac",
    match: /\bhvac\b|\bair.?cond|\bheater\b|\bdefroster\b|\bclimate\b|\bblower\b/,
    playbooks: ["cabin-upsell", "pre-shop"],
    quotes: [
      { slug: "cabin", stamp: "Cabin", label: "Cabin filter" },
      { slug: "inspection", stamp: "Insp", label: "Inspection" },
    ],
    patterns: [],
    why: "A $15 filter before a $1,400 HVAC package. Complaint counts, not Consumer Reports.",
  },
  {
    id: "exhaust",
    match: /\bexhaust\b|\bcatalytic\b|\bemission\b|\bo2 sensor\b|\blambda\b/,
    playbooks: ["check-engine", "pre-shop"],
    quotes: [
      { slug: "inspection", stamp: "Insp", label: "Inspection" },
      { slug: "evap", stamp: "EVAP", label: "EVAP" },
    ],
    patterns: ["p0420-cat-efficiency"],
    why: "P0420 is a pattern card. Not a converter from the code title.",
  },
];

const PATTERN_STAMP: Record<string, string> = {
  "takata-family": "Takata+",
  "takata-accord-2003": "Takata",
  "honda-cvt-start-clutch": "HCF-2",
  "honda-accord-trans-03": "04 AT",
  "honda-15t-dilution": "1.5T",
  "honda-j35-vcm": "VCM",
  "honda-vtc-rattle": "VTC",
  "nissan-cvt-judder": "CVT",
  "ford-dps6": "DPS6",
  "ford-10r80": "10R80",
  "ford-ecoboost-coolant": "EB cool",
  "ford-coil-on-plug": "COP",
  "ford-54-spark-plug": "5.4",
  "gm-afm-lifter": "AFM",
  "gm-dexcool-intake": "Dex-Cool",
  "gm-ignition-switch": "Ign",
  "toyota-2az-consumption": "2AZ",
  "toyota-frame-rust": "Frame",
  "toyota-hybrid-inverter": "Inverter",
  "jeep-9speed": "948TE",
  "hyundai-theta": "Theta",
  "nissan-qr25-oil": "QR25",
  "subaru-fb-oil": "FB oil",
  "ev-12v-silent": "12V",
  "tesla-lv-battery": "LV",
  "p0420-cat-efficiency": "P0420",
  "brake-indicator-squeal": "Squeal",
  "chrysler-tipm": "TIPM",
};

function tokens(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function bucketFor(component: string) {
  const hay = tokens(component);
  if (!hay) return undefined;
  return BUCKETS.find((row) => row.match.test(hay));
}

export function complaintCardFor(component: string): ComplaintPatternCard {
  const bucket = bucketFor(component);
  if (!bucket) {
    return {
      component,
      bucket: "unmapped",
      playbookSlugs: ["complaint-pile", "pre-shop"],
      quoteSlugs: [{ slug: "inspection", stamp: "Insp", label: "Inspection" }],
      patternIds: [],
      why: "No dedicated bucket for this SaferCar label. Pre-shop script, then SaferCar VIN. Complaint counts, not Consumer Reports.",
    };
  }
  return {
    component,
    bucket: bucket.id,
    playbookSlugs: bucket.playbooks,
    quoteSlugs: bucket.quotes,
    patternIds: bucket.patterns,
    why: bucket.why,
  };
}

export function filterPatternsForMake(patternIds: string[], make?: string): string[] {
  const mk = (make ?? "").trim().toLowerCase();
  if (!mk) return patternIds;
  const honda = /honda|acura/.test(mk);
  const toyota = /toyota|lexus/.test(mk);
  const ford = /ford|lincoln/.test(mk);
  const gm = /chevrolet|chevy|gmc|cadillac|buick/.test(mk);
  const nissan = /nissan|infiniti/.test(mk);
  const jeep = /jeep|ram|dodge|chrysler/.test(mk);
  const hyundai = /hyundai|kia/.test(mk);
  const subaru = /subaru/.test(mk);
  const tesla = /tesla/.test(mk);

  return patternIds.filter((id) => {
    if (id.startsWith("honda-") || id.startsWith("takata-accord")) return honda || id === "takata-family";
    if (id.startsWith("toyota-")) return toyota;
    if (id.startsWith("ford-")) return ford;
    if (id.startsWith("gm-")) return gm;
    if (id.startsWith("nissan-")) return nissan;
    if (id.startsWith("jeep-") || id.startsWith("chrysler-")) return jeep;
    if (id.startsWith("hyundai-")) return hyundai;
    if (id.startsWith("subaru-")) return subaru;
    if (id.startsWith("tesla-")) return tesla;
    return true;
  });
}

export function linksForComplaint(component: string, make?: string): ComplaintDeskLink[] {
  const card = complaintCardFor(component);
  const patterns = filterPatternsForMake(card.patternIds, make);
  const seen = new Set<string>();
  const out: ComplaintDeskLink[] = [];
  for (const slug of card.playbookSlugs) {
    const link = playbookLink(slug);
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  for (const job of card.quoteSlugs) {
    const link = quoteLink(job.slug, job.stamp, job.label);
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  for (const id of patterns.slice(0, 3)) {
    const link = patternLink(id, PATTERN_STAMP[id] ?? "Pattern");
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
  }
  return out;
}

export function componentsForPlaybook(playbookId: string): string[] {
  const key = playbookId.trim().toLowerCase();
  return BUCKETS.filter((row) => row.playbooks.includes(key)).map((row) => row.id);
}

export const COMPLAINT_BUCKET_COUNT = BUCKETS.length;
export const COMPLAINT_MAP_DISCLAIMER =
  "Complaint counts, not Consumer Reports. SaferCar component labels mapped to playbooks and quote job slugs. CR is a magazine we do not license. Not a Carfax.";
