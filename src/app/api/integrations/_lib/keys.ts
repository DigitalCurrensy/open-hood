import { contactMailerStatus } from "@/lib/contact/mail";
import {
  PACKET_CHECKOUT_PATH,
  packetCheckoutAllowed,
  packetNotice,
  packetProduct,
} from "@/lib/stripe/packet";
import { stripeKeyKind } from "@/lib/trust/hold";
import type { FounderRow, KeyRow, ProbeKind, StripeRow } from "@/app/integrations/bay-types";

export const WEEKEND_KEYS = [
  "OPENAI_API_KEY",
  "CARSXE_API_KEY",
  "MARKETCHECK_API_KEY",
  "VINAUDIT_API_KEY",
  "GOOGLE_PLACES_API_KEY",
  "YELP_API_KEY",
  "YOUTUBE_API_KEY",
  "RESEND_API_KEY",
  "STRIPE_SECRET_KEY",
] as const;

const WEEKEND = new Set<string>(WEEKEND_KEYS);

export function present(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

const WIRED: Array<
  Omit<KeyRow, "configured" | "keyPresent" | "refused" | "probed"> & {
    configured: () => boolean;
  }
> = [
  {
    env: "OPENAI_API_KEY",
    wired: true,
    label: "Photo reading",
    usedFor: "VIN and quote photos use the bay reader first. Missing key → on-device reading.",
    unlocks: "OpenAI vision on /quote and /api/ocr. Never invents a line it cannot see.",
    connectUrl: "https://platform.openai.com/api-keys",
    openWhenReady: "/agent",
    configured: () => present("OPENAI_API_KEY"),
  },
  {
    env: "GOOGLE_PLACES_API_KEY",
    wired: true,
    label: "Google Places",
    usedFor: "Denser rooftops on /directory. OSM stays live without it.",
    unlocks: "Nearby Search merge via /api/integrations/places. No Maps HTML scrape.",
    connectUrl: "https://console.cloud.google.com/google/maps-apis/api-list",
    openWhenReady: "/directory",
    configured: () => present("GOOGLE_PLACES_API_KEY"),
  },
  {
    env: "YELP_API_KEY",
    wired: true,
    label: "Yelp Fusion",
    usedFor: "Optional phone / address merge. Public Yelp search still works.",
    unlocks: "Fusion /v3/businesses/search via /api/integrations/yelp. Off → no invented stars.",
    connectUrl: "https://www.yelp.com/developers/v3/manage_app",
    openWhenReady: "/directory",
    configured: () => present("YELP_API_KEY"),
  },
  {
    env: "YOUTUBE_API_KEY",
    wired: true,
    label: "YouTube Data API",
    usedFor: "Related how-to clips. Search URLs work with no key. We do not scrape.",
    unlocks: "search.list clip IDs we actually received. Off → videos:[], link-out only.",
    connectUrl: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
    openWhenReady: "/guides",
    configured: () => present("YOUTUBE_API_KEY"),
  },
  {
    env: "CARSXE_API_KEY",
    wired: true,
    label: "CarsXE plate-to-VIN",
    usedFor: "Plate decode on /history. Missing key → the plate stays a note.",
    unlocks: "POST /api/history/plate and /api/integrations/plate. Off → no VIN invented.",
    connectUrl: "https://api.carsxe.com/",
    openWhenReady: "/history",
    configured: () => present("CARSXE_API_KEY"),
  },
  {
    env: "MARKETCHECK_API_KEY",
    wired: true,
    label: "MarketCheck plate-to-VIN",
    usedFor: "Alternate plate decoder. Listings API is not called until we mean to.",
    unlocks: "Plate hit only. No fake in-stock tiles. Off → plate is a note.",
    connectUrl: "https://www.marketcheck.com/",
    openWhenReady: "/history",
    configured: () => present("MARKETCHECK_API_KEY"),
  },
  {
    env: "RESEND_API_KEY",
    wired: true,
    label: "Contact mailer",
    usedFor: "Needs RESEND_API_KEY and CONTACT_TO_EMAIL. Either missing → local JSONL.",
    unlocks: "Email the RO window. We do not invent an inbox.",
    connectUrl: "https://resend.com/api-keys",
    openWhenReady: "/contact",
    configured: () => contactMailerStatus().delivery === "email",
  },
  {
    env: "VINAUDIT_API_KEY",
    wired: true,
    label: "VinAudit title snapshot",
    usedFor: "Paid title / salvage on /history. Missing key → outbound Carfax / AutoCheck / NMVTIS cards.",
    unlocks: "GET/POST /api/history/title names VinAudit. Never invents a wreck or a Carfax XML.",
    connectUrl: "https://www.vinaudit.com/api",
    openWhenReady: "/history",
    configured: () => present("VINAUDIT_API_KEY"),
  },
];

const PAPER: Array<Omit<KeyRow, "configured" | "keyPresent" | "refused" | "wired" | "probed">> = [
  {
    env: "CHROME_DATA_KEY",
    label: "Chrome Data (J.D. Power)",
    usedFor: "No live catalog. /sticker prints vPIC fields and says it is not a Monroney.",
    unlocks: "Style IDs, packages, destination, RPO — after a signed contract. ROADMAP.",
    connectUrl: "https://www.jdpower.com/business/automotive/chrome-data",
    openWhenReady: "/sticker",
  },
  {
    env: "MOTOR_API_KEY",
    label: "MOTOR / Identifix",
    usedFor: "No Motor client in this bay. Hours stay heuristic. We do not invent book time.",
    unlocks: "Labor times and TSBs after a shop license. ROADMAP.",
    connectUrl: "https://www.motor.com/",
    openWhenReady: "/estimate",
  },
  {
    env: "TECALLIANCE_KEY",
    label: "TecDoc / TecAlliance",
    usedFor: "Empty parts bay. No fake SKUs. Outbound storefront search stays live.",
    unlocks: "VIN-linked interchange after a TecAlliance license. ROADMAP.",
    connectUrl: "https://www.tecalliance.net/en/contact/",
    openWhenReady: "/directory/parts",
  },
  {
    env: "MITCHELL_API_KEY",
    label: "Mitchell / ProDemand",
    usedFor: "No estimating feed. /estimate is a ZIP band until a signed extract exists.",
    unlocks: "Shop labor times after a contract. ROADMAP.",
    connectUrl: "https://www.mitchell.com/contact-us",
    openWhenReady: "/estimate",
  },
  {
    env: "ALLDATA_API_KEY",
    label: "ALLDATA",
    usedFor: "No scraped manuals. Request access if they will sell a feed.",
    unlocks: "Service information after a subscription they will actually sell.",
    connectUrl: "https://www.alldata.com/us/en/contact",
    openWhenReady: "/expert",
  },
  {
    env: "NMVTIS_PROVIDER_KEY",
    label: "NMVTIS approved provider",
    usedFor: "Federal title brands. We will not scrape NMVTIS HTML.",
    unlocks: "AAMVA-approved snapshot after a commercial agreement. ROADMAP.",
    connectUrl: "https://vehiclehistory.bja.ojp.gov/nmvtis_consumers",
    openWhenReady: "/history",
  },
  {
    env: "KBB_API_KEY",
    label: "Cox / KBB valuation",
    usedFor: "/value stays an illustration until we fetch a residual we are allowed to show.",
    unlocks: "Licensed comps after a Cox contract. A key does not invent a number. ROADMAP.",
    connectUrl: "https://www.coxautoinc.com/contact/",
    openWhenReady: "/value",
  },
  {
    env: "EBAY_CLIENT_ID",
    label: "eBay Browse API",
    usedFor: "Search URLs work today. Live listings need client + secret + OAuth.",
    unlocks: "Motors listings in-app after OAuth. We will not scrape HTML.",
    connectUrl: "https://developer.ebay.com/",
    openWhenReady: "/finder",
  },
  {
    env: "EBAY_CLIENT_SECRET",
    label: "eBay Browse secret",
    usedFor: "Companion to EBAY_CLIENT_ID. Both + OAuth, or listings stay outbound search.",
    unlocks: "OAuth token. A secret alone does not flip configured:true.",
    connectUrl: "https://developer.ebay.com/",
    openWhenReady: "/finder",
  },
  {
    env: "CARAPI_API_KEY",
    label: "CarAPI",
    usedFor: "Trim trees. NHTSA vPIC already covers VIN identity.",
    unlocks: "Year/make/model/trim menus after a token. Not required for decode.",
    connectUrl: "https://carapi.app/",
    openWhenReady: "/sticker",
  },
  {
    env: "AUTODEV_API_KEY",
    label: "Auto.dev",
    usedFor: "Marketplace listings. We do not scrape dealer HTML while this stays dark.",
    unlocks: "Listings search after a paid account. ROADMAP.",
    connectUrl: "https://www.auto.dev/",
    openWhenReady: "/auctions",
  },
  {
    env: "PARTSTECH_API_KEY",
    label: "PartsTech",
    usedFor: "ZIP-real shop parts dollars. Not a RockAuto search URL.",
    unlocks: "Shop book after a PartsTech / Nexpart / Worldpac contract. ROADMAP.",
    connectUrl: "https://www.partstech.com/contact",
    openWhenReady: "/finder",
  },
  {
    env: "CCC_API_KEY",
    label: "CCC / FNOL",
    usedFor: "Carrier first-notice. /trust is a photo list until a contract exists.",
    unlocks: "A claim number we actually received. We do not invent one.",
    connectUrl: "https://www.cccis.com/contact",
    openWhenReady: "/trust",
  },
];

const SITE: Array<{ env: string; unlocks: string }> = [
  { env: "NEXT_PUBLIC_SITE_URL", unlocks: "Canonicals, sitemap, robots, JSON-LD, /llms.txt." },
  { env: "NEXT_PUBLIC_GA_ID", unlocks: "Optional GA4. Unset = no tracker, no pixels." },
  { env: "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION", unlocks: "Optional Search Console HTML-tag. Unset = no meta tag." },
  { env: "CONTACT_TO_EMAIL", unlocks: "Inbox for /contact. Required with RESEND_API_KEY to email." },
  { env: "CONTACT_FROM_EMAIL", unlocks: "Optional From: line. Defaults to Open Hood <hello@…>." },
  { env: "COX_KBB_API_KEY", unlocks: "Alias for a Cox residual. Same rule as KBB_API_KEY — no invented number." },
  {
    env: "STRIPE_PACKET_PRICE_ID",
    unlocks: "Existing Stripe Price for the packet fee. Live Checkout only if this is a real price_ id. Never escrow.",
  },
];

function wiredProbe(configured: boolean): ProbeKind {
  return configured ? "skip" : "none";
}

export function wiredKeyRows(): KeyRow[] {
  return [
    ...WIRED.map((row) => {
      const configured = row.configured();
      return {
        env: row.env,
        label: row.label,
        usedFor: row.usedFor,
        unlocks: row.unlocks,
        connectUrl: row.connectUrl,
        openWhenReady: row.openWhenReady,
        wired: true,
        keyPresent: present(row.env),
        configured,
        probed: wiredProbe(configured),
        refused: false,
      };
    }),
    stripeKeyRow(),
  ];
}

export function paperKeyRows(): KeyRow[] {
  return PAPER.map((row) => ({
    ...row,
    wired: false,
    keyPresent: present(row.env),
    configured: false,
    probed: "none" as const,
    refused: false,
  }));
}

export function stripeKeyRow(): KeyRow {
  const kind = stripeKeyKind();
  const checkout = packetCheckoutAllowed(kind);
  const product = packetProduct(kind);
  const live = kind === "live";
  return {
    env: "STRIPE_SECRET_KEY",
    label: live ? (checkout ? "Stripe live packet" : "Stripe live (detected)") : checkout ? "Stripe test packet" : "Stripe packet fee",
    usedFor: packetNotice(kind),
    unlocks: checkout
      ? live
        ? `Live packet Checkout via ${PACKET_CHECKOUT_PATH}. product:${product}. Escrow, shop cuts, marketplace refused.`
        : `Test Checkout for print packet / hold this bay via ${PACKET_CHECKOUT_PATH}. product:${product}. Not escrow.`
      : live
        ? "Live key detected. product:none. No packet Price ID — no Checkout. Escrow refused."
        : "A sk_test_ key opens test Checkout. sk_live_ needs STRIPE_PACKET_PRICE_ID. Escrow is ROADMAP.",
    connectUrl: "https://dashboard.stripe.com/apikeys",
    openWhenReady: "/integrations",
    wired: true,
    keyPresent: kind !== "none",
    configured: checkout,
    probed: checkout ? "skip" : "none",
    refused: (live && !checkout) || kind === "unknown",
  };
}

export function stripeRow(): StripeRow {
  const kind = stripeKeyKind();
  const checkout = packetCheckoutAllowed(kind);
  const product = packetProduct(kind);
  return {
    kind,
    configured: checkout,
    refused: (kind === "live" && !checkout) || kind === "unknown",
    liveKeyDetected: kind === "live",
    product,
    checkout,
    escrow: false,
    shopCuts: false,
    marketplace: false,
    notice: packetNotice(kind),
    unlocks: stripeKeyRow().unlocks,
    desk: "/integrations",
  };
}

export function founderRows(): FounderRow[] {
  const stripe = stripeKeyRow();
  const wired = wiredKeyRows()
    .filter((row) => row.env !== "STRIPE_SECRET_KEY")
    .map((row) => ({
      env: row.env,
      unlocks: row.unlocks,
      lane: "wired" as const,
      keyPresent: row.keyPresent,
      configured: row.configured,
      weekend: WEEKEND.has(row.env),
    }));
  const paper = paperKeyRows().map((row) => ({
    env: row.env,
    unlocks: row.unlocks,
    lane: "paper" as const,
    keyPresent: row.keyPresent,
    configured: false,
    weekend: false,
  }));
  const site = SITE.map((row) => ({
    env: row.env,
    unlocks: row.unlocks,
    lane: "site" as const,
    keyPresent: present(row.env),
    configured: present(row.env),
    weekend: WEEKEND.has(row.env),
  }));
  return [
    ...wired,
    {
      env: stripe.env,
      unlocks: stripe.unlocks,
      lane: "stripe",
      keyPresent: stripe.keyPresent,
      configured: stripe.configured,
      weekend: true,
    },
    ...paper,
    ...site,
  ];
}

export function configuredForActions(): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  for (const row of [...wiredKeyRows(), ...paperKeyRows()]) {
    map[row.env] = row.configured;
  }
  map.CHROME_DATA_KEY = false;
  map.MOTOR_API_KEY = false;
  map.TECALLIANCE_KEY = false;
  map.MITCHELL_API_KEY = false;
  map.ALLDATA_API_KEY = false;
  map.KBB_API_KEY = false;
  map.COX_KBB_API_KEY = false;
  map.EBAY_CLIENT_ID = false;
  map.EBAY_CLIENT_SECRET = false;
  map.CARAPI_API_KEY = false;
  map.AUTODEV_API_KEY = false;
  map.PARTSTECH_API_KEY = false;
  map.CCC_API_KEY = false;
  map.NMVTIS_PROVIDER_KEY = false;
  return map;
}
