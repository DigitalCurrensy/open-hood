import {
  adjustVehicle,
  allJobs,
  compareQuote,
  dollars,
  formatMoney,
  formatRange,
  formatRate,
  getJob,
  JOB_COUNT,
  priceJob,
  zipBand,
  type CatalogJob,
  type LaborBand,
  type ZipMapping,
} from "@/lib/labor";
import {
  DARK_HOURS_STAMP,
  hoursRowFor,
  hoursStamp,
  loadHoursBook,
  overlayJobHours,
  typicalHoursBook,
  type HoursBook,
  type HoursSource,
} from "@/lib/quote/licensed-hours";
import type { FlaggedQuoteItem, QuoteAnalysisResult, VehicleSpecs } from "@/lib/types";

export const VISION_ON_STAMP = "Vision key on — reading the RO";
export const VISION_OFF_STAMP = "No vision key — paste the RO. Camera is a lottery.";
export const OCR_HONESTY = VISION_OFF_STAMP;
export { DARK_HOURS_STAMP, hoursStamp, typicalHoursBook };
export type { HoursBook, HoursSource };

/** Env presence only. Never returns the secret. */
export function visionKeyOn(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function visionStamp(on: boolean): string {
  return on ? VISION_ON_STAMP : VISION_OFF_STAMP;
}

export type QuoteMatchKind = "catalog" | "regex" | "hours" | "miss";
export type LineRole = "parts" | "labor" | "diagnostic" | "supplies" | "sublet";
export type SignalSeverity = "info" | "ask" | "decline";
export type SignalKind = "bundle" | "markup" | "upsell" | "supplies" | "role";

export type TicketFlag = FlaggedQuoteItem & {
  bookHit: boolean;
  matchKind: QuoteMatchKind;
  script?: string;
  role: LineRole;
  asks: string[];
  jobSlug?: string;
  hoursSource?: HoursSource;
  hoursStamp?: string;
  hoursCatalogId?: string;
};

export interface QuoteHoursStamp {
  source: HoursSource;
  stamp: string;
  licensed: boolean;
  catalogIds: string[];
}

export interface BundleMember {
  key: string;
  label: string;
  present: boolean;
}

export interface BundleReport {
  id: "packed-lof";
  packed: boolean;
  severity: SignalSeverity;
  title: string;
  say: string;
  members: BundleMember[];
  whyWritten: boolean;
  addOnCount: number;
  bait: boolean;
}

export interface TicketSignal {
  id: string;
  kind: SignalKind;
  severity: SignalSeverity;
  title: string;
  say: string;
  members: string[];
}

export interface CounterAsk {
  item: string;
  jobSlug?: string;
  questions: string[];
}

export interface QuoteBookTally {
  hits: number;
  misses: number;
  jobs: number;
  regexes: number;
}

export interface QuoteDefenseResult extends QuoteAnalysisResult {
  flags: TicketSignal[];
  bundle: BundleReport | null;
  asks: CounterAsk[];
  book: QuoteBookTally;
  roles: Record<LineRole, number>;
  hours: QuoteHoursStamp;
}

interface CatalogPart {
  pattern: RegExp;
  fairLow: number;
  fairHigh: number;
  label: string;
  upsellHint?: string;
}

interface QuoteLine {
  item: string;
  price: number | null;
  hours: number | null;
  percent: number | null;
}

const PART_BOOK: CatalogPart[] = [
  {
    pattern: /cabin\s*(air)?\s*filter/i,
    fairLow: 20,
    fairHigh: 45,
    label: "Cabin air filter",
    upsellHint: "This is a glove-box DIY on most cars. $80+ is almost always padding.",
  },
  {
    pattern: /engine\s*air\s*filter|(?<!cabin\s)air\s*filter/i,
    fairLow: 20,
    fairHigh: 50,
    label: "Engine air filter",
  },
  {
    pattern: /oil\s*(and\s*)?(filter\s*)?change|lube/i,
    fairLow: 70,
    fairHigh: 140,
    label: "Synthetic oil change",
  },
  {
    pattern: /wiper/i,
    fairLow: 25,
    fairHigh: 55,
    label: "Wiper blades",
  },
  {
    pattern: /fuel\s*(injector|system)\s*(clean|flush|service)|sea\s*foam|engine\s*flush/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Fuel system flush",
    upsellHint: "Rarely indicated. Ask what test failed before you authorize a bottled additive at shop prices.",
  },
  {
    pattern: /transmission\s*flush|trans(?:mission)?\s*flush|power\s*flush/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Transmission flush",
    upsellHint: "Many OEMs specify drain-and-fill, not a pressurized flush. Ask for the page in the service schedule.",
  },
  {
    pattern: /throttle\s*body\s*(clean|service|flush)/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Throttle body service",
    upsellHint: "Not a scheduled item on most late-model cars. Ask what symptom it fixes.",
  },
  {
    pattern: /cabin|pollen|micron/i,
    fairLow: 20,
    fairHigh: 45,
    label: "Cabin filter",
    upsellHint: "This is a glove-box DIY on most cars. $80+ is almost always padding.",
  },
  {
    pattern: /brake\s*pad/i,
    fairLow: 180,
    fairHigh: 420,
    label: "Brake pads (axle, parts + labor)",
  },
  {
    pattern: /rotor|brake\s*disc/i,
    fairLow: 250,
    fairHigh: 550,
    label: "Rotors (axle, parts + labor)",
  },
  {
    pattern: /battery/i,
    fairLow: 150,
    fairHigh: 280,
    label: "Battery",
  },
  {
    pattern: /spark\s*plug/i,
    fairLow: 120,
    fairHigh: 320,
    label: "Spark plugs (set)",
  },
  {
    pattern: /coolant\s*(flush|exchange|service)|radiator\s*flush/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Coolant flush",
    upsellHint: "Color is not a spec. Ask for the OEM coolant name and whether a drain-and-fill was offered first.",
  },
  {
    pattern: /brake\s*fluid\s*(flush|exchange|service)|bleed\s*brakes/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Brake fluid flush",
    upsellHint: "DOT number lives on the cap. A “brake service” that is only fluid at cabin-filter prices is padding unless they wrote a test.",
  },
  {
    pattern: /induction\s*(clean|service)|intake\s*clean|walnut\s*blast/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Intake / induction service",
    upsellHint: "Not a scheduled LOF add-on. Ask what carbon test or misfire it is supposed to fix.",
  },
  {
    pattern: /shop\s*suppl(y|ies)|hazardous\s*waste|environmental\s*fee/i,
    fairLow: 0,
    fairHigh: 15,
    label: "Shop supplies / hazmat",
    upsellHint: "A percentage of the whole RO is a flag. A flat few dollars for oil disposal is normal.",
  },
  {
    pattern: /nitrogen|n2\s*fill/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Nitrogen fill",
    upsellHint: "Air is 78% nitrogen. Decline unless they can show a leak the fill fixes.",
  },
  {
    pattern: /(?:differential|transfer\s*case|t-?case)\s*flush/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Diff / transfer-case flush",
    upsellHint: "Ask for the OEM interval page. A “flush” on a filled-for-life unit needs a why.",
  },
  {
    pattern: /alignment|four[\s-]*wheel\s*align/i,
    fairLow: 99,
    fairHigh: 169,
    label: "Alignment",
    upsellHint: "Demand the before/after print. An alignment without numbers is a wash.",
  },
  {
    pattern: /starter/i,
    fairLow: 280,
    fairHigh: 720,
    label: "Starter",
  },
  {
    pattern: /alternator|\balt(?:ernator)?\b/i,
    fairLow: 320,
    fairHigh: 850,
    label: "Alternator",
  },
  {
    pattern: /water\s*pump|coolant\s*pump/i,
    fairLow: 280,
    fairHigh: 980,
    label: "Water pump",
  },
  {
    pattern: /timing\s*(belt|chain)|timing[\s-]*belt[\s-]*kit/i,
    fairLow: 650,
    fairHigh: 1800,
    label: "Timing belt / water pump kit",
  },
  {
    pattern: /caliper/i,
    fairLow: 220,
    fairHigh: 620,
    label: "Calipers (axle pair)",
  },
  {
    pattern: /thermostat|t-?stat/i,
    fairLow: 140,
    fairHigh: 380,
    label: "Thermostat",
  },
  {
    pattern: /control\s*arm|wishbone|lower\s*arm|upper\s*arm/i,
    fairLow: 220,
    fairHigh: 620,
    label: "Control arm",
  },
  {
    pattern: /strut/i,
    fairLow: 280,
    fairHigh: 780,
    label: "Strut (corner)",
  },
  {
    pattern: /shock\s*absorber|\bshocks?\b/i,
    fairLow: 140,
    fairHigh: 380,
    label: "Shock",
  },
  {
    pattern: /hub\s*(bearing|assembly)|wheel\s*bearing/i,
    fairLow: 240,
    fairHigh: 680,
    label: "Hub / wheel bearing",
  },
  {
    pattern: /\bevap\b|purge\s*valve|vapor\s*canister|charcoal\s*canister/i,
    fairLow: 140,
    fairHigh: 480,
    label: "EVAP purge / canister",
  },
  {
    pattern: /\bpcv\b|crankcase\s*vent/i,
    fairLow: 35,
    fairHigh: 140,
    label: "PCV valve / hose",
  },
  {
    pattern: /serpentine|drive\s*belt|accessory\s*belt/i,
    fairLow: 55,
    fairHigh: 180,
    label: "Serpentine belt",
  },
  {
    pattern: /transmission\s*(service|drain)|trans(?:mission)?\s*(service|drain)|drain[\s-]*and[\s-]*fill|atf\s*service/i,
    fairLow: 140,
    fairHigh: 320,
    label: "Transmission drain-and-fill",
    upsellHint: "Drain-and-fill is the usual OEM operation. A machine flush is a different yes.",
  },
  {
    pattern: /transfer\s*case|t-?case/i,
    fairLow: 130,
    fairHigh: 290,
    label: "Transfer case service",
  },
  {
    pattern: /headlight\s*bulb|headlamp\s*bulb|tail\s*lamp|brake\s*light\s*bulb|turn\s*signal\s*bulb|\bbulbs?\b/i,
    fairLow: 15,
    fairHigh: 90,
    label: "Exterior bulb",
  },
  {
    pattern: /radiator(?!\s*flush)/i,
    fairLow: 380,
    fairHigh: 980,
    label: "Radiator",
  },
  {
    pattern: /tie[\s-]*rod/i,
    fairLow: 140,
    fairHigh: 360,
    label: "Tie rod",
  },
  {
    pattern: /sway[\s-]*bar|stabilizer\s*link|end\s*link/i,
    fairLow: 90,
    fairHigh: 260,
    label: "Sway-bar link",
  },
  {
    pattern: /cv\s*(axle|joint)|half[\s-]*shaft|axle\s*shaft|drive\s*axle/i,
    fairLow: 220,
    fairHigh: 580,
    label: "CV axle",
  },
  {
    pattern: /ignition\s*coil|coil[\s-]*on[\s-]*plug|coil\s*pack|\bcop\b/i,
    fairLow: 80,
    fairHigh: 280,
    label: "Ignition coil",
  },
  {
    pattern: /o2\s*sensor|oxygen\s*sensor|lambda\s*sensor|air[\s-]*fuel\s*sensor/i,
    fairLow: 120,
    fairHigh: 380,
    label: "Oxygen sensor",
  },
  {
    pattern: /fuel\s*pump|in[\s-]*tank\s*pump|fuel\s*sender/i,
    fairLow: 380,
    fairHigh: 1100,
    label: "Fuel pump",
  },
  {
    pattern: /valve[\s-]*cover|cam\s*cover|rocker\s*cover/i,
    fairLow: 160,
    fairHigh: 420,
    label: "Valve-cover gasket",
  },
  {
    pattern: /diff(?:erential)?\s*(fluid|service)|rear\s*end\s*service|axle\s*fluid/i,
    fairLow: 120,
    fairHigh: 280,
    label: "Differential service",
  },
  {
    pattern: /tire\s*rotat|rotate\s*tires|rotation\s*and\s*balance/i,
    fairLow: 25,
    fairHigh: 50,
    label: "Tire rotation",
  },
  {
    pattern: /parking\s*brake|emergency\s*brake|handbrake|\bepb\b/i,
    fairLow: 140,
    fairHigh: 420,
    label: "Parking-brake service",
  },
  {
    pattern: /window\s*(regulator|motor)|door\s*regulator/i,
    fairLow: 180,
    fairHigh: 520,
    label: "Window regulator",
  },
  {
    pattern: /\bmaf\b|mass\s*air|air\s*flow\s*sensor/i,
    fairLow: 110,
    fairHigh: 320,
    label: "MAF sensor",
  },
  {
    pattern: /brake\s*hose|caliper\s*hose/i,
    fairLow: 90,
    fairHigh: 240,
    label: "Brake hose",
  },
  {
    pattern: /fuel\s*filter|inline\s*fuel\s*filter/i,
    fairLow: 55,
    fairHigh: 180,
    label: "Fuel filter",
  },
  {
    pattern: /coolant\s*drain|drain[\s-]*and[\s-]*fill\s*coolant|antifreeze/i,
    fairLow: 80,
    fairHigh: 180,
    label: "Coolant drain-and-fill",
  },
  {
    pattern: /diag(?:nostic)?|inspect(?:ion)?|\bmpi\b/i,
    fairLow: 80,
    fairHigh: 220,
    label: "Inspection / diagnostic",
  },
  {
    pattern: /a\/?c\s*(recharge|regas|freon)|r-?134|r-?1234/i,
    fairLow: 0,
    fairHigh: 0,
    label: "A/C recharge",
    upsellHint: "Dye and a leak test first. A top-off without a leak find is a seasonal upsell.",
  },
  {
    pattern: /power\s*steering\s*(flush|service|fluid)/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Power steering flush",
    upsellHint: "Many racks are sealed. Ask for the leak or the OEM interval page.",
  },
  {
    pattern: /sundries|misc(?:ellaneous)?\s*(suppl|fee)|shop\s*misc/i,
    fairLow: 0,
    fairHigh: 15,
    label: "Sundries / misc shop fee",
    upsellHint: "A percentage of the whole RO is a flag. A flat few dollars for oil disposal is normal.",
  },
  {
    pattern: /\bbg\b\s*(service|flush|induction)|wynns?\s*(service|flush)|fuel\s*induction/i,
    fairLow: 0,
    fairHigh: 0,
    label: "Bottled induction / BG service",
    upsellHint: "A bottled service on an LOF ticket needs a failed test. Decline the menu name.",
  },
  {
    pattern: /blower\s*motor|hvac\s*blower|heater\s*fan/i,
    fairLow: 90,
    fairHigh: 280,
    label: "Blower motor",
  },
  {
    pattern: /crank(?:shaft)?\s*(position\s*)?sensor|\bckp\b/i,
    fairLow: 80,
    fairHigh: 260,
    label: "Crankshaft position sensor",
  },
  {
    pattern: /cam(?:shaft)?\s*(position\s*)?sensor|\bcmp\b/i,
    fairLow: 70,
    fairHigh: 220,
    label: "Camshaft position sensor",
  },
  {
    pattern: /\btpms\b|tire\s*pressure\s*sensor/i,
    fairLow: 40,
    fairHigh: 140,
    label: "TPMS sensor (one)",
  },
  {
    pattern: /belt\s*tensioner|idler\s*pulley|tensioner\s*pulley/i,
    fairLow: 70,
    fairHigh: 220,
    label: "Belt tensioner / idler",
  },
  {
    pattern: /(?:upper|lower|radiator|coolant)\s*hose/i,
    fairLow: 45,
    fairHigh: 160,
    label: "Radiator hose (one)",
  },
  {
    pattern: /wheel[\s-]*speed\s*sensor|\babs\s*sensor\b|\bwss\b/i,
    fairLow: 70,
    fairHigh: 240,
    label: "Wheel-speed sensor",
  },
  {
    pattern: /door\s*lock\s*actuator|lock\s*actuator/i,
    fairLow: 110,
    fairHigh: 320,
    label: "Door lock actuator",
  },
  {
    pattern: /knock\s*sensor|detonation\s*sensor/i,
    fairLow: 90,
    fairHigh: 320,
    label: "Knock sensor",
  },
  {
    pattern: /washer\s*(pump|motor)|windshield\s*washer\s*pump/i,
    fairLow: 35,
    fairHigh: 110,
    label: "Washer pump",
  },
];

export const PART_BOOK_COUNT = PART_BOOK.length;
export const JOB_BOOK_COUNT = JOB_COUNT;

type CatalogJobWithAsk = CatalogJob & { ask?: string[] };

type PackKey = "lof" | "cabin" | "coolant-flush" | "induction" | "nitrogen" | "supplies-pct";

const PACK_MENU: { key: PackKey; label: string; core?: boolean; pattern: RegExp }[] = [
  { key: "lof", label: "Oil / LOF", core: true, pattern: /oil\s*(and\s*)?(filter\s*)?change|\blof\b|\blube\b|synthetic\s*oil|oil\s*\+\s*filter|\boil\s*filter\b|(?:^|[\n;])\s*oil\b/i },
  { key: "cabin", label: "Cabin filter", pattern: /cabin|pollen|micron/i },
  { key: "coolant-flush", label: "Coolant flush", pattern: /coolant\s*(flush|exchange)|radiator\s*flush/i },
  { key: "induction", label: "Induction", pattern: /induction|intake\s*clean|walnut\s*blast|carbon\s*clean|fuel\s*induction/i },
  { key: "nitrogen", label: "Nitrogen", pattern: /nitrogen|n2\s*(fill|tire)/i },
  {
    key: "supplies-pct",
    label: "Shop supplies %",
    pattern: /(?:shop\s*suppl|hazmat|environmental|sundries).{0,28}\d{1,2}(?:\.\d+)?\s*%|\d{1,2}(?:\.\d+)?\s*%.{0,28}(?:shop\s*suppl|hazmat|sundries)/i,
  },
];

const WHY_RE =
  /\b(failed|failing|failure|tested|test\s+failed|code\s*p[0-9]|p0[0-9]{3}|interval|oem\s+(page|schedul)|tsb|misfire|leak(?:ing)?|due\s+at|discard|\bmm\b|moisture|boiling|pressure\s+test|measure[ds]?|why:|because)\b/i;

const ROLE_RULES: { role: LineRole; pattern: RegExp }[] = [
  { role: "supplies", pattern: /shop\s*suppl|sundries|hazmat|hazardous|environmental\s*fee|waste\s*fee|shop\s*fee/i },
  { role: "sublet", pattern: /sublet|sent\s*out|vendor|machine\s*shop|towing|outside\s*labor|third[\s-]*party/i },
  { role: "diagnostic", pattern: /diag(?:nostic)?|inspect(?:ion)?|\bmpi\b|scan\s*(fee|tool)|test\s*drive|code\s*read|health\s*check/i },
  { role: "labor", pattern: /\blabor\b|\bhrs?\b|\bhours?\b|r\s*&\s*r|remove\s*and\s*replace|install(?:ation)?\s*labor/i },
];

const ASK_OVERLAY: Record<string, string[]> = {
  oil: [
    "Write the oil spec and the liters on the RO.",
    "What is the posted door rate if this LOF is above the independent band?",
    "Is every add-on a separate yes — cabin, flush, induction?",
  ],
  cabin: [
    "Show me the old filter.",
    "Why is a glove-box part a labor line?",
    "Write the brand and the list price.",
  ],
  coolant: [
    "Write the OEM coolant name — color is not a spec.",
    "Was a drain-and-fill offered, or only a machine flush?",
    "What test or interval page requires this today?",
  ],
  pads: [
    "Measure both rotors in millimeters and write the discard spec.",
    "Are shop supplies a flat hazmat line or a percent of the RO?",
    "Pads and rotors stay two lines if both are due.",
  ],
  "Cabin air filter": [
    "Show me the old filter.",
    "I will R&R this in the lot if you cannot show why the box is that high.",
  ],
  "Cabin filter": [
    "Show me the old filter.",
    "I will R&R this in the lot if you cannot show why the box is that high.",
  ],
  "Coolant flush": [
    "Color is not a spec. Write the OEM coolant name.",
    "A machine flush is a second yes after drain-and-fill.",
  ],
  "Intake / induction service": [
    "What carbon test or misfire does this fix?",
    "Induction is not a scheduled LOF add-on.",
  ],
  "Nitrogen fill": ["Air is 78% nitrogen. What leak does this fill fix?"],
  "Shop supplies / hazmat": [
    "Is this a flat oil-disposal fee or a percent of the whole RO?",
    "A percentage on pads-plus-labor is padding. Write a few dollars or take it off.",
  ],
};

const EMPTY_ROLES: Record<LineRole, number> = {
  parts: 0,
  labor: 0,
  diagnostic: 0,
  supplies: 0,
  sublet: 0,
};

function needle(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function uniqueLines(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of lines) {
    const key = needle(line);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

export function classifyLineRole(item: string, hours: number | null = null): LineRole {
  for (const rule of ROLE_RULES) {
    if (rule.pattern.test(item)) return rule.role;
  }
  if (hours != null && !/\$/.test(item) && /hr|hour/i.test(item)) return "labor";
  return "parts";
}

function catalogAsks(job: CatalogJob | undefined): string[] {
  if (!job) return [];
  const extra = job as CatalogJobWithAsk;
  return Array.isArray(extra.ask) ? extra.ask.filter((row) => row.trim().length > 0) : [];
}

function overlayAsks(flag: TicketFlag): string[] {
  const keys = [flag.jobSlug, flag.item].filter((key): key is string => Boolean(key));
  const rows: string[] = [];
  for (const key of keys) {
    const found = ASK_OVERLAY[key];
    if (found) rows.push(...found);
  }
  return rows;
}

function asksForFlag(flag: TicketFlag, job?: CatalogJob): string[] {
  const fromSay = flag.script ? [flag.script] : [];
  const fromJob = job?.sayIfHigh ? [job.sayIfHigh.replaceAll("{high}", "the independent high")] : [];
  return uniqueLines([...catalogAsks(job), ...overlayAsks(flag), ...fromSay, ...fromJob]).slice(0, 4);
}

function hayFromTicket(quoteText: string, items: QuoteLine[], flags: TicketFlag[]): string {
  return [quoteText, ...items.map((row) => row.item), ...flags.map((row) => row.item)].join("\n");
}

function suppliesPercentOn(items: QuoteLine[]): boolean {
  return items.some(
    (row) =>
      row.percent != null &&
      row.percent >= 4 &&
      /shop|suppl|hazmat|environ|sundries/i.test(row.item),
  );
}

function detectPackedLof(
  quoteText: string,
  items: QuoteLine[],
  flags: TicketFlag[],
): BundleReport | null {
  const hay = hayFromTicket(quoteText, items, flags);
  const members: BundleMember[] = PACK_MENU.map((entry) => {
    const onLine = items.some((row) =>
      entry.key === "lof"
        ? entry.pattern.test(row.item) || /^(oil)\b/i.test(row.item.trim())
        : entry.pattern.test(row.item),
    );
    const present =
      entry.key === "supplies-pct"
        ? entry.pattern.test(hay) || suppliesPercentOn(items) || onLine
        : entry.pattern.test(hay) || onLine;
    return { key: entry.key, label: entry.label, present };
  });

  const lof = members.find((row) => row.key === "lof")?.present ?? false;
  const addOns = members.filter((row) => row.key !== "lof" && row.present);
  if (!lof || addOns.length < 2) return null;

  const whyWritten = WHY_RE.test(quoteText);
  const packedTrio =
    addOns.some((row) => row.key === "cabin") &&
    addOns.some((row) => row.key === "coolant-flush") &&
    addOns.some((row) => row.key === "induction");
  const decline = (!whyWritten && addOns.length >= 2) || packedTrio || addOns.length >= 3;

  const oilPrice =
    items.find((row) => /oil|lof|lube/i.test(row.item) && !/coil|toilet/i.test(row.item))?.price ?? null;
  const addOnTotal = items
    .filter((row) => {
      const key = packKeyFor(row.item, row.percent);
      return key != null && key !== "lof";
    })
    .reduce((sum, row) => sum + (row.price ?? 0), 0);
  const bait = oilPrice != null && addOnTotal > oilPrice;

  const named = addOns.map((row) => row.label).join(" + ");
  const say = whyWritten
    ? `Packed service on an LOF: ${named}. They wrote a why — still split each add-on into its own yes.`
    : `Packed service. Decline unless they wrote a why. ${named} landed on a lube ticket with no test, no interval page, no code.`;

  return {
    id: "packed-lof",
    packed: true,
    severity: decline ? "decline" : "ask",
    title: "Packed service",
    say,
    members,
    whyWritten,
    addOnCount: addOns.length,
    bait,
  };
}

function packKeyFor(item: string, percent: number | null): PackKey | null {
  for (const entry of PACK_MENU) {
    if (entry.key === "supplies-pct") {
      if (entry.pattern.test(item) || (percent != null && percent >= 4 && /shop|suppl|hazmat|sundries/i.test(item))) {
        return entry.key;
      }
      continue;
    }
    if (entry.pattern.test(item)) return entry.key;
  }
  return null;
}

function collectSignals(
  flags: TicketFlag[],
  bundle: BundleReport | null,
  items: QuoteLine[],
): TicketSignal[] {
  const signals: TicketSignal[] = [];

  if (bundle?.packed) {
    signals.push({
      id: "packed-lof",
      kind: "bundle",
      severity: bundle.severity,
      title: bundle.title,
      say: bundle.say,
      members: bundle.members.filter((row) => row.present).map((row) => row.label),
    });
    if (!bundle.whyWritten) {
      signals.push({
        id: "bundle-no-why",
        kind: "bundle",
        severity: "decline",
        title: "No why on the RO",
        say: "Packed service, decline unless they wrote a why — a test, a code, an interval page, or a measurement.",
        members: bundle.members.filter((row) => row.present && row.key !== "lof").map((row) => row.label),
      });
    }
    if (bundle.bait) {
      signals.push({
        id: "lof-bait",
        kind: "bundle",
        severity: "ask",
        title: "LOF bait",
        say: "The add-ons cost more than the oil change. That is the menu, not the maintenance.",
        members: bundle.members.filter((row) => row.present && row.key !== "lof").map((row) => row.label),
      });
    }
  }

  for (const flag of flags) {
    if (flag.category === "markup" && /cabin/i.test(flag.item)) {
      signals.push({
        id: "cabin-markup",
        kind: "markup",
        severity: "ask",
        title: "Cabin filter markup",
        say: flag.warning,
        members: [flag.item],
      });
    }
    if (flag.category === "upsell" && /flush/i.test(flag.item)) {
      signals.push({
        id: "flush-upsell",
        kind: "upsell",
        severity: "decline",
        title: "Flush upsell",
        say: flag.warning,
        members: [flag.item],
      });
    }
    if (/induction|intake \/ induction/i.test(flag.item) && flag.category !== "ok") {
      signals.push({
        id: "induction-upsell",
        kind: "upsell",
        severity: "decline",
        title: "Induction add-on",
        say: flag.warning,
        members: [flag.item],
      });
    }
    if (/nitrogen/i.test(flag.item) && flag.category !== "ok") {
      signals.push({
        id: "nitrogen-upsell",
        kind: "upsell",
        severity: "decline",
        title: "Nitrogen fill",
        say: flag.warning,
        members: [flag.item],
      });
    }
    if (
      /shop suppl|hazmat/i.test(flag.item) &&
      (/%/.test(flag.warning) || items.some((row) => row.percent != null && row.percent >= 4))
    ) {
      signals.push({
        id: "supplies-percent",
        kind: "supplies",
        severity: "ask",
        title: "Shop supplies as a percent",
        say: flag.warning,
        members: [flag.item],
      });
    }
  }

  if (items.some((row) => /pad/i.test(row.item) && /rotor|disc/i.test(row.item))) {
    signals.push({
      id: "lumped-brakes",
      kind: "role",
      severity: "ask",
      title: "Pads and rotors lumped",
      say: "Split pads and rotors. Do not pay two full labor books on one line.",
      members: items.filter((row) => /pad|rotor|disc/i.test(row.item)).map((row) => row.item),
    });
  }

  const seen = new Set<string>();
  return signals.filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });
}

function collectTicketAsks(flags: TicketFlag[], bundle: BundleReport | null): CounterAsk[] {
  const asks: CounterAsk[] = [];
  if (bundle?.packed) {
    asks.push({
      item: bundle.title,
      questions: [
        bundle.say,
        "Write a why on each add-on — test, code, interval page — or take it off.",
      ],
    });
  }
  for (const flag of flags) {
    if (!flag.asks.length) continue;
    if (flag.category === "ok" && !flag.jobSlug) continue;
    asks.push({ item: flag.item, jobSlug: flag.jobSlug, questions: flag.asks });
  }
  return asks.slice(0, 8);
}

function tallyRoles(flags: TicketFlag[]): Record<LineRole, number> {
  const roles = { ...EMPTY_ROLES };
  for (const flag of flags) roles[flag.role] += 1;
  return roles;
}

function emptyBook(hits = 0, misses = 0): QuoteBookTally {
  return { hits, misses, jobs: JOB_BOOK_COUNT, regexes: PART_BOOK_COUNT };
}

function hoursMeta(book: HoursBook | null | undefined): QuoteHoursStamp {
  const resolved = book ?? typicalHoursBook();
  return {
    source: resolved.licensed ? resolved.source : "typical",
    stamp: resolved.licensed ? resolved.stamp : DARK_HOURS_STAMP,
    licensed: Boolean(resolved.licensed),
    catalogIds: resolved.licensed ? resolved.catalogIds : [],
  };
}

function asDefense(
  base: Omit<QuoteAnalysisResult, "flaggedItems"> & { flaggedItems: TicketFlag[] },
  extras: {
    flags: TicketSignal[];
    bundle: BundleReport | null;
    asks: CounterAsk[];
    book: QuoteBookTally;
    roles: Record<LineRole, number>;
    hours?: QuoteHoursStamp;
  },
): QuoteDefenseResult {
  return { ...base, ...extras, hours: extras.hours ?? hoursMeta(null) };
}

function normalizeOcrJunk(text: string): string {
  return text
    .replace(/fi[il1]ter/gi, "filter")
    .replace(/f1lter/gi, "filter")
    .replace(/\b0il\b/gi, "oil")
    .replace(/\b1ube\b/gi, "lube")
    .replace(/\bca[b8]in\b/gi, "cabin")
    .replace(/cab1n/gi, "cabin")
    .replace(/c[o0]{1,2}lant/gi, "coolant")
    .replace(/coo[il1]ant/gi, "coolant")
    .replace(/\bf[il1]ush\b/gi, "flush")
    .replace(/induct[il1]on/gi, "induction")
    .replace(/n[il1]trogen/gi, "nitrogen")
    .replace(/supp[li1]{2,}es/gi, "supplies")
    .replace(/\$\s+/g, "$")
    .replace(/\$[oOlI](\d)/g, "$$$1")
    .replace(
      /\b((?:filter|flush|oil|cabin|coolant|pads?|labor|change|induction|nitrogen|wiper|rotor|battery|lube))\s+[sS](\d{2,5}(?:\.\d{2})?)\b/g,
      "$1 $$$2",
    )
    .replace(/(\d)\s+\.\s+(\d{2})\b/g, "$1.$2");
}

const JOBISH_PRICE =
  /((?:cabin(?:\s+air)?(?:\s+filter)?|oil(?:\s+change)?|coolant\s+flush|induction(?:\s+service)?|brake\s+pads?|nitrogen|shop\s+suppl(?:y|ies)|lube))(?:\s|\$)+(\d{2,5}(?:\.\d{2})?)/gi;

function extractInlinePairs(blob: string): string[] {
  const priced = [...blob.matchAll(/([A-Za-z][\w\s/&.-]{2,32}?)\s*\$\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)].map(
    (match) => `${match[1].replace(/\s+/g, " ").trim()} $${match[2]}`,
  );
  const jobish = [...blob.matchAll(JOBISH_PRICE)].map(
    (match) => `${match[1].replace(/\s+/g, " ").trim()} $${match[2]}`,
  );
  const percents = [...blob.matchAll(/((?:shop\s*suppl|hazmat|environmental|sundries)[^\n%]{0,32})(\d{1,2}(?:\.\d+)?)\s*%/gi)].map(
    (match) => `${match[1].replace(/\s+/g, " ").trim()} ${match[2]}%`,
  );
  return [...priced, ...jobish, ...percents];
}

function parsePercent(text: string): number | null {
  const match = text.match(/(\d{1,2}(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) && value > 0 && value <= 40 ? value : null;
}

function dollarsFrom(text: string): number[] {
  const stripped = text.replace(/(\d{1,2}(?:\.\d+)?)\s*%/g, " ");
  return [...stripped.matchAll(/\$?\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)]
    .map((match) => Number.parseFloat(match[1].replace(/,/g, "")))
    .filter((value) => Number.isFinite(value) && value >= 8);
}

function parseHours(text: string): number | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\b/i);
  if (!match) return null;
  const hours = Number.parseFloat(match[1]);
  return Number.isFinite(hours) && hours > 0 && hours < 40 ? hours : null;
}

function resolveZip(raw?: string | null): { mapping: ZipMapping; band: LaborBand } | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length < 5) return null;
  try {
    return zipBand(digits.slice(0, 5));
  } catch {
    return null;
  }
}

function jobFromLine(item: string): CatalogJob | undefined {
  const cleaned = item.replace(/(\d+(?:\.\d+)?)\s*(?:hrs?|hours?)\b/gi, " ").replace(/\s+/g, " ").trim();
  const exact = getJob(cleaned) ?? getJob(item);
  if (exact) return exact;

  const hay = needle(cleaned);
  if (!hay) return undefined;

  let best: { job: CatalogJob; score: number } | undefined;
  for (const job of allJobs()) {
    const keys = [job.slug, job.id, job.label, job.stamp, ...job.aliases].map(needle).filter(Boolean);
    for (const key of keys) {
      if (key.length < 3) continue;
      const contained = hay.includes(key);
      const container = !contained && key.includes(hay) && hay.length >= 8;
      if (!contained && !container) continue;
      const score = contained ? key.length + 12 : hay.length;
      if (!best || score > best.score) best = { job, score };
    }
  }
  return best && best.score >= 15 ? best.job : undefined;
}

function asLine(line: string): QuoteLine {
  const prices = dollarsFrom(line);
  return {
    item: line.replace(/\$[\d,.]+/g, "").replace(/\s+/g, " ").trim(),
    price: prices.at(-1) ?? null,
    hours: parseHours(line),
    percent: parsePercent(line),
  };
}

function isQuoteIsh(line: string): boolean {
  if (/\$\s*\d/.test(line) || /\d+\.\d{2}/.test(line)) return true;
  if (parsePercent(line) != null && /shop|suppl|hazmat|environ/i.test(line)) return true;
  if (parseHours(line)) return true;
  if (PART_BOOK.some((part) => part.pattern.test(line))) return true;
  return Boolean(jobFromLine(line));
}

export function extractQuoteLinesFromOcr(text: string): string {
  const cleaned = normalizeOcrJunk(text);
  const rawLines = cleaned
    .split(/\r?\n|;|\u2022|\s+\+\s+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 2);
  const fromLines = rawLines.flatMap((line) => {
    if (!isQuoteIsh(line) && !extractInlinePairs(line).length) return [];
    const pairs = extractInlinePairs(line);
    return pairs.length ? pairs : [line];
  });
  const blobPairs = fromLines.length ? [] : extractInlinePairs(cleaned);
  const merged = uniqueLines(fromLines.length ? fromLines : blobPairs.length ? blobPairs : rawLines);
  if (merged.length) return merged.join("\n");
  return cleaned.trim();
}

function parseLineItems(quoteText: string): QuoteLine[] {
  const source = extractQuoteLinesFromOcr(quoteText);
  const lines = source
    .split(/\r?\n|;|\u2022|\s+\+\s+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 3);

  if (lines.length <= 1) {
    const priced = [...source.matchAll(/([A-Za-z][\w\s/.-]{1,48}?)\s*\$\s*(\d{1,5}(?:,\d{3})*(?:\.\d{2})?)/g)].map(
      (match) => ({
        item: match[1].replace(/\s+/g, " ").trim(),
        price: Number.parseFloat(match[2].replace(/,/g, "")),
        hours: parseHours(match[0]),
        percent: parsePercent(match[0]),
      }),
    );
    if (priced.length > 1) return priced;

    const only = lines[0] ?? source.trim();
    return only.length > 3 ? [asLine(only)] : [];
  }

  return lines.map(asLine);
}

function keepHeuristic(book: CatalogPart): boolean {
  return book.fairHigh === 0 || /cabin|shop suppl|hazmat|sundries/i.test(book.label);
}

function withMeta(
  item: FlaggedQuoteItem,
  matchKind: QuoteMatchKind,
  script?: string,
  jobSlug?: string,
  hours?: { source: HoursSource; stamp: string; catalogId?: string },
): TicketFlag {
  const role = classifyLineRole(item.item);
  return {
    ...item,
    bookHit: matchKind !== "miss",
    matchKind,
    script,
    role,
    asks: [],
    jobSlug,
    hoursSource: hours?.source,
    hoursStamp: hours?.stamp,
    hoursCatalogId: hours?.catalogId,
  };
}

function enrichFlag(flag: TicketFlag): TicketFlag {
  const job = flag.jobSlug ? getJob(flag.jobSlug) : jobFromLine(flag.item);
  const role = flag.role !== "parts" ? flag.role : classifyLineRole(flag.item);
  return {
    ...flag,
    role,
    jobSlug: flag.jobSlug ?? job?.slug,
    asks: asksForFlag({ ...flag, jobSlug: flag.jobSlug ?? job?.slug }, job),
  };
}

function flagFromBook(
  book: CatalogPart,
  quotedPrice: number | null,
  extras: { percent?: number | null; roTotal?: number | null } = {},
): TicketFlag {
  const percent = extras.percent ?? null;
  const roTotal = extras.roTotal ?? null;
  const supplyLine = /shop suppl|sundries|hazmat/i.test(book.label);
  const supplyShare =
    supplyLine && quotedPrice != null && roTotal != null && roTotal > quotedPrice
      ? quotedPrice / roTotal
      : null;

  if (supplyLine && ((percent != null && percent >= 4) || (supplyShare != null && supplyShare >= 0.04))) {
    const shown = percent != null ? `${percent.toFixed(0)}% of the RO` : `${Math.round((supplyShare ?? 0) * 100)}% of the RO`;
    return withMeta(
      {
        item: book.label,
        quotedPrice,
        fairPriceRange: "Flat hazmat a few dollars — not a percent",
        warning: `${shown}. ${book.upsellHint ?? "A percentage of the whole RO is a flag."}`,
        category: "upsell",
      },
      "regex",
      book.upsellHint,
    );
  }

  if (book.fairHigh === 0) {
    return withMeta(
      {
        item: book.label,
        quotedPrice,
        fairPriceRange: "Usually $0 unless a test failed",
        warning: book.upsellHint ?? "Ask for the OEM service-interval page.",
        category: "upsell",
      },
      "regex",
      book.upsellHint,
    );
  }

  if (quotedPrice != null && quotedPrice > book.fairHigh * 1.35) {
    return withMeta(
      {
        item: book.label,
        quotedPrice,
        fairPriceRange: `$${book.fairLow.toFixed(0)} – $${book.fairHigh.toFixed(0)}`,
        warning: book.upsellHint ?? `Quoted well above typical retail + independent-shop labor.`,
        category: "markup",
      },
      "regex",
      book.upsellHint,
    );
  }

  if (book.upsellHint && quotedPrice != null && quotedPrice > book.fairHigh) {
    return withMeta(
      {
        item: book.label,
        quotedPrice,
        fairPriceRange: `$${book.fairLow.toFixed(0)} – $${book.fairHigh.toFixed(0)}`,
        warning: book.upsellHint,
        category: "markup",
      },
      "regex",
      book.upsellHint,
    );
  }

  return withMeta(
    {
      item: book.label,
      quotedPrice,
      fairPriceRange: `$${book.fairLow.toFixed(0)} – $${book.fairHigh.toFixed(0)}`,
      warning: "Within a normal independent-shop band. Still ask to see the old part.",
      category: "ok",
    },
    "regex",
  );
}

function flagFromHours(quotedPrice: number | null, hours: number, band: LaborBand): TicketFlag {
  const low = dollars(hours * band.indieLow);
  const high = dollars(hours * band.indieHigh);
  const over = quotedPrice != null && quotedPrice > high;
  const script = over
    ? `Quoted above the ${band.label} independent high of ${formatMoney(high)} for ${hours} hr (${formatRate(band.indieHigh)}). Ask them to write hours × the posted door rate.`
    : undefined;
  return withMeta(
    {
      item: `${hours} hr labor`,
      quotedPrice,
      fairPriceRange: formatRange(low, high),
      warning: over
        ? script ?? "Ask them to write hours × the posted door rate."
        : `${hours} hr at the ${band.label} independent band is ${formatRange(low, high)}. Still ask for the posted door rate.`,
      category: over ? "labor" : "ok",
    },
    "hours",
    script,
  );
}

function flagFromJob(
  job: CatalogJob,
  quotedPrice: number | null,
  hours: number | null,
  specs: VehicleSpecs,
  band: LaborBand,
  hoursBook?: HoursBook | null,
): TicketFlag {
  const licensed = hoursRowFor(job, hoursBook);
  const priced = overlayJobHours(job, hoursBook);
  const estimate = priceJob(priced, band, adjustVehicle(specs.year, specs.make, specs.model));
  const hoursMetaForLine = licensed
    ? { source: licensed.source, stamp: hoursStamp(licensed.source, licensed.catalogId), catalogId: licensed.catalogId }
    : { source: "typical" as const, stamp: DARK_HOURS_STAMP };
  if (!estimate.applicable) {
    return withMeta(
      {
        item: job.label,
        quotedPrice,
        fairPriceRange: "Not this car",
        warning: estimate.skipReason ?? "This job does not apply to this vehicle.",
        category: "upsell",
      },
      "catalog",
      estimate.sayIfHigh,
      job.slug,
      hoursMetaForLine,
    );
  }

  const compare = quotedPrice != null ? compareQuote(quotedPrice, estimate) : null;
  const over = compare != null && (compare.verdict === "above-indie" || compare.verdict === "above-dealer");
  const bandHigh = formatMoney(estimate.total.indie.high);
  const laborNote =
    hours != null
      ? ` They wrote ${hours} hr. Independent high for this ZIP is ${bandHigh}.`
      : ` Independent high for this ZIP is ${bandHigh}.`;

  return withMeta(
    {
      item: job.label,
      quotedPrice,
      fairPriceRange: estimate.beginnerRange,
      warning: over
        ? `${compare.say}${hours != null ? laborNote : ""}`
        : (compare?.say ?? `${estimate.notes} Band high is ${bandHigh}.`),
      category: over ? (hours != null ? "labor" : "markup") : "ok",
    },
    "catalog",
    over ? estimate.sayIfHigh : undefined,
    job.slug,
    hoursMetaForLine,
  );
}

function flagMiss(line: QuoteLine): TicketFlag {
  return withMeta(
    {
      item: line.item || "Unmatched line",
      quotedPrice: line.price,
      fairPriceRange: "Not in the typical-hour book",
      warning:
        "Heuristic miss. This line did not match our independent typical-hour book. Paste a clearer job name if the scan garbled it.",
      category: "ok",
    },
    "miss",
  );
}

function flagItem(
  line: QuoteLine,
  specs: VehicleSpecs,
  mapped: { mapping: ZipMapping; band: LaborBand } | null,
  roTotal: number | null,
  hoursBook?: HoursBook | null,
): TicketFlag | null {
  const book = PART_BOOK.find((entry) => entry.pattern.test(line.item));
  if (book && keepHeuristic(book)) return flagFromBook(book, line.price, { percent: line.percent, roTotal });

  if (mapped) {
    const job = jobFromLine(line.item);
    if (job) return flagFromJob(job, line.price, line.hours, specs, mapped.band, hoursBook);
    if (line.hours != null) return flagFromHours(line.price, line.hours, mapped.band);
  }

  if (book) return flagFromBook(book, line.price, { percent: line.percent, roTotal });
  if (line.price != null || line.percent != null || line.hours != null) return flagMiss(line);
  return null;
}

function scriptsFor(flags: TicketFlag[], specs: VehicleSpecs, bundle?: BundleReport | null): string[] {
  const vehicle = [specs.year, specs.make, specs.model].filter(Boolean).join(" ") || "this vehicle";
  const lines: string[] = [];

  if (bundle?.packed) lines.push(bundle.say);

  for (const flag of flags.filter((item) => item.category !== "ok")) {
    if (flag.script) {
      lines.push(flag.script);
      continue;
    }
    if (flag.quotedPrice != null) {
      lines.push(
        `I noticed ${flag.item} is quoted at $${flag.quotedPrice.toFixed(2)}. Typical range is ${flag.fairPriceRange}. I'll hold off on that today.`,
      );
    } else {
      lines.push(`Could you show me the manufacturer page that requires ${flag.item} on a ${vehicle}?`);
    }
  }

  if (flags.some((item) => /rotor|brake pad/i.test(item.item))) {
    lines.push(
      `Please measure the rotor thickness in millimeters and show me the reading. I want the number next to the ${vehicle} discard spec, not just "they're due."`,
    );
  }

  if (lines.length === 0) {
    lines.push(
      `Before you start, please write the labor hours and the OEM part numbers on the RO. I want to see the old parts when you're done.`,
    );
  }

  lines.push(`If anything extra shows up after you open it up, call me before you add it. Don't go past the written estimate.`);
  return lines.slice(0, 8);
}

function laborRateLine(
  mapped: { mapping: ZipMapping; band: LaborBand } | null,
  hours?: QuoteHoursStamp,
): string | null {
  if (!mapped) return null;
  const { mapping, band } = mapped;
  const book = hours?.stamp ?? DARK_HOURS_STAMP;
  return `${band.label} heuristic · indie ${formatRate(band.indieLow)}–${formatRate(band.indieHigh)} · dealer ${formatRate(band.dealerLow)}–${formatRate(band.dealerHigh)} · ZIP ${mapping.zip} · ${book}`;
}

export function analyzeQuoteText(
  quoteText: string,
  specs: VehicleSpecs,
  zip?: string | null,
  hoursBook?: HoursBook | null,
): QuoteDefenseResult {
  const mapped = resolveZip(zip);
  const items = parseLineItems(quoteText);
  const prices = items.map((row) => row.price).filter((price): price is number => price != null);
  const totalQuoted = prices.length ? prices.reduce((sum, price) => sum + price, 0) : null;
  const hours = hoursMeta(hoursBook);
  const flaggedItems = items
    .map((row) => flagItem(row, specs, mapped, totalQuoted, hoursBook))
    .filter((row): row is TicketFlag => Boolean(row))
    .map(enrichFlag);

  const problems = flaggedItems.filter((item) => item.category !== "ok");
  const hits = flaggedItems.filter((item) => item.bookHit);
  const misses = flaggedItems.filter((item) => !item.bookHit);
  const zipNote = mapped ? ` vs the ${mapped.band.label} heuristic band for ZIP ${mapped.mapping.zip}` : "";
  const bundle = detectPackedLof(quoteText, items, flaggedItems);
  const flags = collectSignals(flaggedItems, bundle, items);
  const asks = collectTicketAsks(flaggedItems, bundle);
  const book = emptyBook(hits.length, misses.length);
  const roles = tallyRoles(flaggedItems);

  const empty: TicketFlag = enrichFlag(
    withMeta(
      {
        item: "Unparsed estimate",
        quotedPrice: totalQuoted,
        fairPriceRange: "Need line items",
        warning: "I couldn't map this to known jobs. Paste each line (part + price) so we can mark this up against the typical-hour book.",
        category: "ok",
      },
      "miss",
    ),
  );

  const packedNote = bundle?.packed ? ` Packed service — ${bundle.say}` : "";
  const hitNote = `${hits.length} book hit${hits.length === 1 ? "" : "s"}${misses.length ? `, ${misses.length} heuristic miss${misses.length === 1 ? "" : "es"}` : ""}`;

  return asDefense(
    {
      isQuoteFair: problems.length === 0 && hits.length > 0 && !bundle?.packed,
      shopName: null,
      laborRateEstimate: laborRateLine(mapped, hours),
      totalQuoted,
      flaggedItems: flaggedItems.length ? flaggedItems : [empty],
      mechanicScript: scriptsFor(problems, specs, bundle),
      summary:
        problems.length === 0 && !bundle?.packed
          ? misses.length && !hits.length
            ? `No typical-hour-book hits. ${misses.length} line${misses.length === 1 ? "" : "s"} unmatched (heuristic miss). Still ask for OEM part numbers.`
            : "Nothing jumped out as a classic upsell. Still ask for OEM part numbers and to see the old parts."
          : `${problems.length} line item${problems.length === 1 ? "" : "s"} look high or optional${zipNote}. ${hitNote}.${packedNote} Use the counter script before you authorize work.`,
      usedVisionModel: false,
    },
    { flags, bundle, asks, book, roles, hours },
  );
}

export async function analyzeQuote(
  quoteText: string,
  specs: VehicleSpecs,
  zip?: string | null,
): Promise<QuoteDefenseResult> {
  const items = parseLineItems(quoteText);
  const jobKeys = items
    .map((row) => jobFromLine(row.item)?.slug)
    .filter((slug): slug is string => Boolean(slug));
  const hoursBook = await loadHoursBook({
    jobKeys,
    year: specs.year,
    make: specs.make,
    model: specs.model,
  });
  return analyzeQuoteText(quoteText, specs, zip, hoursBook);
}

export function demoQuote(specs: VehicleSpecs, zip?: string | null): QuoteDefenseResult {
  const cabin = allJobs().find((job) => job.slug === "cabin");
  const flaggedItems: TicketFlag[] = [
    enrichFlag(
      withMeta(
        {
          item: "Cabin Air Filter Replacement",
          quotedPrice: 85,
          fairPriceRange: "$20.00 – $35.00",
          warning: "Extreme markup for labor. This part is about $15 and is a glove-box swap on most cars.",
          category: "markup",
        },
        "regex",
        cabin?.sayIfHigh.replace("{high}", "$45") ??
          "Cabin filter at $45 in this ZIP is the top of the independent band. I will R&R it in the lot if you cannot show me why the box is that high.",
        "cabin",
      ),
    ),
    enrichFlag(
      withMeta(
        {
          item: "Transmission Flush",
          quotedPrice: 249,
          fairPriceRange: "Usually $0 unless the schedule says drain-and-fill",
          warning: "Flush services are a frequent add-on. Ask for the OEM interval page for this VIN's mileage.",
          category: "upsell",
        },
        "regex",
        "Many OEMs specify drain-and-fill, not a pressurized flush. Ask for the page in the service schedule.",
      ),
    ),
  ];
  const bundle = detectPackedLof("Cabin Air Filter Replacement $85\nTransmission Flush $249", [], flaggedItems);
  const flags = collectSignals(flaggedItems, bundle, []);
  const asks = collectTicketAsks(flaggedItems, bundle);

  return asDefense(
    {
      isQuoteFair: false,
      shopName: "Bay 3 Express",
      laborRateEstimate: laborRateLine(resolveZip(zip), hoursMeta(null)) ?? "$195/hr implied — above typical independent ($120–150)",
      totalQuoted: 334,
      flaggedItems,
      mechanicScript: scriptsFor(flaggedItems, specs, bundle),
      summary: "Demo ticket: a cheap cabin filter padded to $85 plus an unscheduled flush. This is the pattern Open Hood is built to catch.",
      usedVisionModel: false,
    },
    {
      flags,
      bundle,
      asks,
      book: emptyBook(2, 0),
      roles: tallyRoles(flaggedItems),
      hours: hoursMeta(null),
    },
  );
}

export function asQuoteDefense(result: QuoteAnalysisResult): QuoteDefenseResult {
  const extra = result as QuoteDefenseResult;
  const lines = result.flaggedItems.map((item) => {
    const flag = item as TicketFlag;
    return enrichFlag({
      ...item,
      bookHit: flag.bookHit !== false && flag.matchKind !== "miss",
      matchKind: flag.matchKind ?? "regex",
      script: flag.script,
      role: flag.role ?? classifyLineRole(item.item),
      asks: flag.asks ?? [],
      jobSlug: flag.jobSlug,
    });
  });
  const hits = lines.filter((row) => row.bookHit).length;
  const misses = lines.filter((row) => !row.bookHit).length;
  const proxyItems = lines.map((row) => ({ item: row.item, price: row.quotedPrice, hours: null, percent: null }));
  const bundle = extra.bundle ?? detectPackedLof(lines.map((row) => row.item).join("\n"), proxyItems, lines);
  const flags = extra.flags ?? collectSignals(lines, bundle, proxyItems);
  return {
    ...result,
    flaggedItems: lines,
    flags,
    bundle,
    asks: extra.asks ?? collectTicketAsks(lines, bundle),
    book: extra.book ?? emptyBook(hits, misses),
    roles: extra.roles ?? tallyRoles(lines),
    hours: extra.hours ?? hoursMeta(null),
  };
}
