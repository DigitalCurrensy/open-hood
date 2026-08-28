import { partSearchLinks } from "@/lib/directory/parts";
import { filterPlaybooks, playbooksHref } from "@/lib/expert/playbooks";
import { searchRoTerms } from "@/lib/jobs/glossary";
import { AGENT_FN_NAMES, type AgentFnName, type AgentTool, type AgentVehicleContext } from "@/lib/agent/types";

export const AGENT_FUNCTION_LIST: AgentFnName[] = [...AGENT_FN_NAMES];

function fn(
  name: AgentFnName,
  description: string,
  properties: Record<string, { type: string; description: string }>,
  required: string[] = [],
) {
  return {
    type: "function" as const,
    function: {
      name,
      description,
      parameters: {
        type: "object",
        properties,
        required,
        additionalProperties: false,
      },
    },
  };
}

export const OPENAI_TOOL_SCHEMAS = [
  fn("decode_vin", "Decode a 17-character VIN via NHTSA vPIC. Not a plate-to-VIN lookup.", {
    vin: { type: "string", description: "17-character VIN. Letters I, O, Q are never used." },
  }, ["vin"]),
  fn("lookup_dtc", "Translate a typed OBD/ABS/SRS/network code. A pointer, not a diagnosis. No bluetooth dongle.", {
    code: { type: "string", description: "Five-character code such as P0420." },
  }, ["code"]),
  fn("analyze_quote_text", "Mark padded RO lines from pasted text. Local price book plus ZIP labor band. Not live dealer pricing.", {
    text: { type: "string", description: "Quote lines: part + price." },
    zip: { type: "string", description: "Shop ZIP so labor is compared to that region’s indie band." },
  }, ["text"]),
  fn("diagnose_symptoms", "Map a noise and when it happens to shop questions. Not a parts catalog.", {
    noise: { type: "string", description: "squeal | grinding | clicking | thumping | rumble | hiss | none" },
    when: { type: "string", description: "braking | turning | accelerating | idling | highway | cold-start | always" },
    warningLight: { type: "string", description: "true if a warning light is on" },
    leak: { type: "string", description: "true if there is a leak" },
    pull: { type: "string", description: "true if the car pulls" },
  }, ["noise"]),
  fn("get_fluids_for_vehicle", "Fluids / PSI / filter SKU card for the vehicle on the hook. Catalog or heuristic — confirm the door jamb.", {}),
  fn("search_guides", "Search owner how-to guides. Not a factory torque book.", {
    q: { type: "string", description: "Job words: cabin filter, oil change, flush, pads." },
  }, ["q"]),
  fn("search_directory", "OSM rooftops near a ZIP or city. We do not book or certify shops.", {
    zip: { type: "string", description: "ZIP or city." },
    type: { type: "string", description: "dealers | repair | parts | tires | body | towing | inspection | carwash" },
  }, ["zip"]),
  fn("get_recalls", "NHTSA SaferCar campaigns for year/make/model on the hook. Not VIN open/closed.", {}),
  fn("get_epa_mpg", "Official EPA city/hwy/combined from FuelEconomy.gov for the vehicle on the hook.", {}),
  fn("search_playbooks", "Named owner playbooks (Takata, used-car PPI, quote fight). Beginner script + Expert units. Not a stolen TSB.", {
    q: { type: "string", description: "Jam words: takata, used car, quote, brakes." },
  }, ["q"]),
  fn("lookup_ro_term", "Invoice slang: LOF, MPI, R&R, shop supplies, NTF. Not legal advice.", {
    q: { type: "string", description: "Ticket word: LOF, MPI, flush, shop supplies." },
  }, ["q"]),
  fn("search_parts", "Outbound RockAuto / AutoZone / Amazon / eBay Motors search URLs. Not TecDoc. Not live stock.", {
    part: { type: "string", description: "Part words: oil filter, pads, battery." },
  }, ["part"]),
];

export const AGENT_TOOL_BOOK: Record<AgentTool["href"], AgentTool> = {
  "/quote": {
    href: "/quote",
    stamp: "Quote",
    title: "Quote defense",
    reason: "Paste or photo the RO. We grease-pencil padded lines.",
  },
  "/symptoms": {
    href: "/symptoms",
    stamp: "Noise",
    title: "Symptom wizard",
    reason: "Map the sound and the moment to shop questions.",
  },
  "/guides": {
    href: "/guides",
    stamp: "Guide",
    title: "Guides",
    reason: "DIY vs shop, and what a 'flush' actually is.",
  },
  "/directory": {
    href: "/directory",
    stamp: "Shops",
    title: "Directory",
    reason: "Find a shop. We do not book or take a cut.",
  },
  "/obd": {
    href: "/obd",
    stamp: "OBD",
    title: "OBD codes",
    reason: "Type the scanner code. No dongle required.",
  },
  "/expert": {
    href: "/expert",
    stamp: "Play",
    title: "Playbooks",
    reason: "Named jams: Takata, used-car PPI, a light, a quote. Beginner script, Expert units.",
  },
  "/garage": {
    href: "/garage",
    stamp: "Spec",
    title: "Spec sheet",
    reason: "Oil, coolant, PSI, filter SKUs. Confirm the door jamb.",
  },
  "/catalog": {
    href: "/catalog",
    stamp: "Book",
    title: "Fluids book",
    reason: "Search the year/make/model pamphlet. Not TecDoc.",
  },
  "/recalls": {
    href: "/recalls",
    stamp: "Recall",
    title: "Recalls",
    reason: "NHTSA campaigns in plain English. Dealer closes them — we do not.",
  },
};

export function pickTools(...hrefs: AgentTool["href"][]): AgentTool[] {
  const seen = new Set<AgentTool["href"]>();
  const tools: AgentTool[] = [];
  for (const href of hrefs) {
    if (seen.has(href)) continue;
    seen.add(href);
    const ticket = AGENT_TOOL_BOOK[href];
    if (ticket) tools.push(ticket);
  }
  return tools;
}

export const QUICK_PROMPTS = [
  { label: "They quoted a flush", text: "They quoted a flush" },
  { label: "Squeal when braking", text: "Squeal when braking" },
  { label: "Check engine P0420", text: "Check engine P0420" },
  { label: "Is this a dealer-only job?", text: "Is this a dealer-only job?" },
  { label: "Any recalls on this car?", text: "Any recalls on this car?" },
] as const;

export interface PlaybookToolHit {
  slug: string;
  title: string;
  href: string;
  plainEnglish: string;
  script: string[];
}

export interface PlaybookSearchResult {
  query: string;
  href: string;
  hits: PlaybookToolHit[];
  note: string;
}

/** Named jam cards on /expert. Public patterns, not a stolen TSB book. */
export function searchPlaybooks(query: string, limit = 4): PlaybookSearchResult {
  const q = query.replace(/\s+/g, " ").trim();
  const rows = (q ? filterPlaybooks({ q }) : []).slice(0, limit);
  return {
    query: q,
    href: playbooksHref({ q }),
    hits: rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      href: `/expert/${row.slug}`,
      plainEnglish: row.plainEnglish,
      script: row.script.slice(0, 2),
    })),
    note:
      rows.length === 0
        ? "No playbook matched. Open /expert or name the jam: brakes, a light, a quote, a used-car buy."
        : "Beginner column is the sentence at the window. Expert column is the unit (mm, PSI, freeze-frame). Not a pirated bulletin.",
  };
}

export interface RoTermHit {
  slug: string;
  term: string;
  href: string;
  means: string;
  sayToOwner: string;
  trap: string;
}

export interface RoTermLookupResult {
  query: string;
  hits: RoTermHit[];
  note: string;
}

/** Invoice slang on /jobs/ro-terms. Not legal advice. */
export function lookupRoTerm(query: string, limit = 4): RoTermLookupResult {
  const raw = query.replace(/\s+/g, " ").trim();
  const q = raw
    .replace(/^what does\s+/i, "")
    .replace(/\s+mean\b.*$/i, "")
    .replace(/\s+on (the )?(ro|ticket|invoice|estimate).*$/i, "")
    .replace(/[?."“”]+/g, "")
    .trim();
  const rows = (q ? searchRoTerms(q) : []).slice(0, limit);
  return {
    query: q,
    hits: rows.map((row) => ({
      slug: row.slug,
      term: row.term,
      href: `/jobs/ro-terms/${row.slug}`,
      means: row.means,
      sayToOwner: row.sayToOwner,
      trap: row.trap,
    })),
    note:
      rows.length === 0
        ? "No RO term matched. Try LOF, MPI, R&R, shop supplies, or NTF — or open /jobs/ro-terms."
        : "Slang is not a measurement. Shop supplies need a dollar. 'While we're in there' needs a yes.",
  };
}

export interface PartsSearchResult {
  query: string;
  year: string;
  make: string;
  model: string;
  rockauto: string;
  autozone: string;
  oreilly: string;
  napa: string;
  amazon: string;
  ebayMotors: string;
  note: string;
}

/** Outbound catalog search URLs. Not TecDoc. Not live dealer stock. */
export function searchParts(part: string, vehicle?: AgentVehicleContext): PartsSearchResult {
  const q = part.replace(/\s+/g, " ").trim();
  const year = vehicle?.year?.trim() ?? "";
  const make = vehicle?.make?.trim() ?? "";
  const model = vehicle?.model?.trim() ?? "";
  const links = partSearchLinks(year, make, model, q || "filter");
  return {
    query: links.query,
    year,
    make,
    model,
    rockauto: links.rockauto,
    autozone: links.autozone,
    oreilly: links.oreilly,
    napa: links.napa,
    amazon: links.amazon,
    ebayMotors: links.ebayMotors,
    note: "Search URLs only — RockAuto, AutoZone, O’Reilly, NAPA. We do not invent an interchange, a shelf, or a cart.",
  };
}
