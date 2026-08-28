import { ALL_BAY_PIPES } from "@/app/integrations/extra-pipes";
import type { LicensedCatalogRow, PipeRow, PipeState, ProbeKind } from "@/app/integrations/bay-types";
import { EMPTY_CONTEXT } from "@/lib/integrations/types";
import {
  WEEKEND_KEYS,
  configuredForActions,
  founderRows,
  paperKeyRows,
  stripeRow,
  wiredKeyRows,
} from "@/app/api/integrations/_lib/keys";
import { probePublicPipes } from "@/app/api/integrations/_lib/probes";
import { packetCheckoutAllowed } from "@/lib/stripe/packet";
import { stripeKeyKind } from "@/lib/trust/hold";

const LIVE_PROBE_IDS = new Set([
  "nhtsa-vpic",
  "nhtsa-safercar",
  "nhtsa-ncap",
  "nhtsa-complaints",
  "epa-mpg",
  "osm-nominatim",
  "overpass",
]);

const IN_BAY_LIVE_IDS = new Set(["quote-desk", "fluids-catalog", "elm327-scan"]);

const UNLOCKS: Record<string, string> = {
  "nhtsa-vpic": "Public VIN decode. No key.",
  "nhtsa-safercar": "Year/make/model campaigns. VIN open/closed is a SaferCar link — recallsByVin is 403.",
  "nhtsa-ncap": "Public NCAP stars for a tested variant.",
  "nhtsa-complaints": "ODI owner narratives. Not a failure rate.",
  "epa-mpg": "Official city / hwy / combined from FuelEconomy.gov.",
  "epa-findacar": "Government Find-a-Car / PowerSearch.",
  "epa-green": "EPA Green Vehicle Guide pages.",
  "osm-nominatim": "ZIP → pin. 1 req/s, User-Agent required.",
  overpass: "Shop tags around the pin on /directory. This bay does not rewrite Overpass.",
  "youtube-howto": "Search URLs always. Clips only with YOUTUBE_API_KEY. No scrape.",
  openai: "Vision on quote / VIN photos. Off → on-device OCR.",
  "google-places": "Nearby rooftops. Off → connected:false, results:[].",
  "yelp-fusion": "Fusion merge. Off → no invented stars.",
  "youtube-data": "search.list. Off → videos:[], link-out only.",
  carsxe: "Plate-to-VIN. Off → plate is a note. No invented VIN.",
  marketcheck: "Plate-to-VIN. Listings stay dark until we call them on purpose.",
  vinaudit: "Title snapshot when VINAUDIT_API_KEY is on. Off → outbound cards. Never a dummy Carfax.",
  "chrome-data": "No live catalog. connected:false. ROADMAP after contract.",
  "motor-identifix": "MOTOR / Identifix · Hearst Aftermarket shop license. connected:false, skus:[]. ROADMAP.",
  tecdoc: "TecDoc / TecAlliance · TecAlliance catalog license. connected:false, skus:[]. ROADMAP.",
  partstech: "PartsTech / Nexpart / Worldpac · shop parts book. connected:false, skus:[]. ROADMAP.",
  "stripe-escrow": "Live capture and escrow are refused. Shop cuts and marketplace refused. Counsel first.",
  "stripe-test": "sk_test_ opens packet Checkout. sk_live_ needs an existing Price ID. Never escrow.",
  "contact-resend": "Email when both mailer keys are on. Else local JSONL.",
  "quote-desk": "In-bay RO markup. Local price book.",
  "fluids-catalog": "In-bay capacities. Door jamb wins.",
  "elm327-scan": "Web Bluetooth PIDs + Mode 03. Not Torque.",
};

const ADAPTERS: Record<string, string> = {
  "nhtsa-vpic": "/api/integrations/nhtsa?kind=vin",
  "nhtsa-safercar": "/api/integrations/nhtsa?kind=recalls",
  "nhtsa-ncap": "/api/integrations/nhtsa?kind=ratings",
  "nhtsa-complaints": "/api/integrations/nhtsa?kind=complaints",
  "epa-mpg": "/api/integrations/mpg",
  "osm-nominatim": "/api/integrations/geocode",
  "youtube-howto": "/api/integrations/youtube",
  "youtube-data": "/api/integrations/youtube",
  "google-places": "/api/integrations/places",
  "yelp-fusion": "/api/integrations/yelp",
  openai: "/api/integrations/openai",
  carsxe: "/api/integrations/plate",
  marketcheck: "/api/integrations/plate",
  vinaudit: "/api/integrations/vinaudit",
  "chrome-data": "/api/integrations/chrome",
  "motor-identifix": "/api/integrations/motor",
  tecdoc: "/api/integrations/catalog",
  partstech: "/api/integrations/partstech",
  "stripe-test": "/api/integrations/stripe",
  "stripe-escrow": "/api/integrations/stripe",
};

function stateFor(id: string, lane: PipeRow["lane"], configured: boolean | null, stripeKind: string): PipeState {
  if (id === "stripe-escrow") return "refused";
  if (id === "stripe-test") {
    if (packetCheckoutAllowed(stripeKeyKind())) return "live";
    if (stripeKind === "live" || stripeKind === "unknown") return "refused";
    return "dark";
  }
  if (id === "chrome-data" || id === "motor-identifix" || id === "tecdoc" || id === "partstech") return "dark";
  if (lane === "catalog") return "dark";
  if (lane === "env") return configured ? "live" : "dark";
  if (LIVE_PROBE_IDS.has(id) || IN_BAY_LIVE_IDS.has(id)) return "live";
  return "outbound";
}

function probedFor(
  id: string,
  lane: PipeRow["lane"],
  configured: boolean | null,
  stripeKind: string,
): ProbeKind | null {
  if (id === "stripe-test") {
    if (stripeKind === "test") return "skip";
    if (stripeKind === "live") return packetCheckoutAllowed() ? "skip" : "none";
    return "none";
  }
  if (id === "stripe-escrow") return "none";
  if (lane === "catalog" || id === "chrome-data" || id === "motor-identifix" || id === "tecdoc" || id === "partstech") {
    return "none";
  }
  if (lane === "env") return configured ? "skip" : "none";
  return null;
}

export function licensedEmpty(): LicensedCatalogRow {
  return {
    skus: [],
    hours: [],
    tecdoc: false,
    motor: false,
    chrome: false,
    partstech: false,
    note: "Licensed catalog is an empty bay. TecDoc / TecAlliance (TecAlliance catalog license), MOTOR / Identifix (Hearst Aftermarket shop license), PartsTech / Nexpart / Worldpac (shop parts book), Chrome Data (J.D. Power Chrome Data), Mitchell, and ALLDATA stay on ROADMAP until a signed contract. A key sitting in env does not fill this bin. We do not invent SKUs, hours, or interchange. OSM remains the shop map.",
  };
}

export async function buildBayStatus(options: { probe?: boolean } = {}) {
  const configured = configuredForActions();
  const stripe = stripeRow();
  const keys = wiredKeyRows();
  const paper = paperKeyRows();
  const founder = founderRows();
  const probes = options.probe === false ? [] : await probePublicPipes();

  const pipes: PipeRow[] = ALL_BAY_PIPES.map((item) => {
    const env = item.env ?? null;
    const isPaper =
      item.lane === "catalog" ||
      item.id === "chrome-data" ||
      item.id === "motor-identifix" ||
      item.id === "tecdoc" ||
      item.id === "partstech";
    let flag: boolean | null = null;
    if (item.lane === "env" && env) flag = Boolean(configured[env]);
    else if (isPaper) flag = false;
    if (item.id === "stripe-test") flag = stripe.configured;
    if (item.id === "stripe-escrow") flag = false;

    return {
      id: item.id,
      name: item.name,
      stamp: item.stamp,
      lane: item.lane,
      family: item.family,
      state: stateFor(item.id, item.lane, flag, stripe.kind),
      configured: flag,
      probed: probedFor(item.id, item.lane, flag, stripe.kind),
      env,
      unlocks: UNLOCKS[item.id] ?? (item.lane === "catalog" ? "Request access. No feed in this bay." : "Official page or in-bay desk."),
      href: item.lane === "catalog" ? (item.connectUrl ?? item.homeUrl) : item.appPath ?? item.homeUrl,
      paper: isPaper || item.lane === "catalog",
      adapter: ADAPTERS[item.id] ?? null,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    count: pipes.length,
    pipes,
    keys,
    paper,
    founder,
    probes,
    stripe,
    licensedCatalog: licensedEmpty(),
    liveIds: pipes.filter((row) => row.lane === "live").map((row) => row.id),
    envIds: pipes.filter((row) => row.lane === "env").map((row) => row.id),
    catalogIds: pipes.filter((row) => row.lane === "catalog").map((row) => row.id),
    weekend: [...WEEKEND_KEYS],
    context: EMPTY_CONTEXT,
  };
}

export { configuredForActions };
