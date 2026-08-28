import { INTEGRATIONS } from "@/lib/integrations/catalog";
import type { IntegrationDef } from "@/lib/integrations/types";
import { partsQuery, ymmQuery } from "@/lib/integrations/urls";

function enc(value: string): string {
  return encodeURIComponent(value.trim());
}

export const EXTRA_PIPES: IntegrationDef[] = [
  {
    id: "overpass",
    stamp: "Rooftops",
    name: "OSM Overpass shops",
    family: "maps",
    lane: "live",
    dummy: "The directory walks shop tags around a pin. We do not book a bay or invent a rooftop.",
    genius: "Overpass is the public shop graph. This jack only opens /directory. Another desk owns the query — we do not rewrite it here.",
    homeUrl: "https://overpass-turbo.eu/",
    href: (ctx) => {
      const q = ctx.address.trim();
      if (/^\d{5}(?:-\d{4})?$/.test(q)) return `/directory/${q}`;
      return q ? `/directory?q=${enc(q)}` : "/directory";
    },
    appPath: "/directory",
  },
  {
    id: "napa",
    stamp: "Retail",
    name: "NAPA Auto Parts",
    family: "parts",
    lane: "live",
    dummy: "Store search for the same part string. We do not know what is on the back wall.",
    genius: "Public storefront query. No interchange table. No TecDoc SKU.",
    homeUrl: "https://www.napaonline.com/",
    href: (ctx) => `https://www.napaonline.com/en/search?text=${enc(partsQuery(ctx))}`,
  },
  {
    id: "pep-boys",
    stamp: "Retail",
    name: "Pep Boys",
    family: "parts",
    lane: "live",
    dummy: "Another counter, same search. Confirm the application before you buy.",
    genius: "Outbound search URL. Inventory APIs are not something we will invent.",
    homeUrl: "https://www.pepboys.com/",
    href: (ctx) => `https://www.pepboys.com/search?q=${enc(partsQuery(ctx))}`,
  },
  {
    id: "tire-rack",
    stamp: "Tires",
    name: "Tire Rack",
    family: "parts",
    lane: "live",
    dummy: "Tire search on their site. Size still comes from the door sticker.",
    genius: "Link-out. We do not scrape fitment or invent a speed rating.",
    homeUrl: "https://www.tirerack.com/",
    href: (ctx) => {
      const q = ymmQuery(ctx);
      return q ? `https://www.tirerack.com/tires/Search.jsp?autoMake=&autoModel=&autoYear=&keywords=${enc(q)}` : "https://www.tirerack.com/";
    },
  },
  {
    id: "nicb-vincheck",
    stamp: "Theft",
    name: "NICB VINCheck",
    family: "history",
    lane: "live",
    dummy: "Free theft and salvage check on NICB’s form. Type the VIN there. We do not scrape it.",
    genius: "National Insurance Crime Bureau consumer tool. No API we are allowed to republish. Open their form.",
    homeUrl: "https://www.nicb.org/vincheck",
    href: () => "https://www.nicb.org/vincheck",
    appPath: "/history",
  },
  {
    id: "autocheck-consumer",
    stamp: "History",
    name: "Experian AutoCheck consumer",
    family: "history",
    lane: "live",
    dummy: "Buy a report from Experian if you need one. We do not pull their score.",
    genius: "Consumer portal only. Business AutoCheck XML is request-access. We will not scrape the HTML.",
    homeUrl: "https://www.autocheck.com/vehiclehistory/vehicle-history-reports",
    href: (ctx) => {
      const vin = ctx.vin.trim().toUpperCase();
      if (vin.length === 17) {
        return `https://www.autocheck.com/vehiclehistory/autocheck/en/vin/${enc(vin)}`;
      }
      return "https://www.autocheck.com/vehiclehistory/vehicle-history-reports";
    },
    appPath: "/history",
  },
  {
    id: "carcomplaints",
    stamp: "Owners",
    name: "CarComplaints",
    family: "history",
    lane: "live",
    dummy: "Owner-logged failures on this nameplate. A pile is a question, not a Carfax.",
    genius: "Public search. Not statistically controlled. SaferCar complaints stay the government file.",
    homeUrl: "https://www.carcomplaints.com/",
    href: (ctx) => {
      const q = ymmQuery(ctx);
      return q ? `https://www.carcomplaints.com/search/?q=${enc(q)}` : "https://www.carcomplaints.com/";
    },
  },
  {
    id: "epa-green",
    stamp: "Green",
    name: "EPA Green Vehicle Guide",
    family: "fuel",
    lane: "live",
    dummy: "Government green scores next to official MPG. Not a dealer brochure.",
    genius: "Find-a-Car / Green Vehicle Guide on FuelEconomy.gov. Combined MPG still comes from the REST menu on the EPA jack.",
    homeUrl: "https://www.epa.gov/greenvehicles",
    href: (ctx) => {
      if (ctx.year && ctx.make) {
        const params = new URLSearchParams({
          action: "noform",
          path: "1",
          year1: ctx.year.trim(),
          year2: ctx.year.trim(),
          make: ctx.make.trim(),
          srchtyp: "ymm",
        });
        if (ctx.model.trim()) params.set("model", ctx.model.trim());
        return `https://www.fueleconomy.gov/feg/PowerSearch.do?${params.toString()}`;
      }
      return "https://www.epa.gov/greenvehicles";
    },
  },
  {
    id: "quote-desk",
    stamp: "Ticket",
    name: "Quote markup desk",
    family: "parts",
    lane: "live",
    dummy: "Paste the RO. Grease-pencil the padded lines. We do not invent shop prices.",
    genius: "In-bay /quote. Local price book. Photo reading needs OPENAI_API_KEY. Missing key is not a dead button.",
    homeUrl: "/quote",
    href: () => "/quote",
    appPath: "/quote",
  },
  {
    id: "fluids-catalog",
    stamp: "Capacities",
    name: "Fluids catalog",
    family: "fuel",
    lane: "live",
    dummy: "Oil, coolant, PSI. Door jamb still wins a catalog miss. No fake SKUs.",
    genius: "In-bay /catalog. Honda demo VIN stays 5W-20. TecDoc interchange is ROADMAP, not this book.",
    homeUrl: "/catalog",
    href: (ctx) => {
      const params = new URLSearchParams();
      if (ctx.year) params.set("year", ctx.year);
      if (ctx.make) params.set("make", ctx.make);
      if (ctx.model) params.set("model", ctx.model);
      const q = params.toString();
      return q ? `/catalog?${q}` : "/catalog";
    },
    appPath: "/catalog",
  },
  {
    id: "elm327-scan",
    stamp: "Puck",
    name: "Web Bluetooth ELM327",
    family: "safety",
    lane: "live",
    dummy: "Pair a cheap puck on Chrome / Android. Type the code if the phone will not pair.",
    genius: "In-bay /scan. A few PIDs + Mode 03. Not Torque. Not iOS BLE.",
    homeUrl: "/scan",
    href: () => "/scan",
    appPath: "/scan",
  },
  {
    id: "stripe-test",
    stamp: "Packet",
    name: "Stripe packet fee",
    family: "licensed",
    lane: "env",
    env: "STRIPE_SECRET_KEY",
    dummy: "A test key opens Checkout for an optional print-packet / hold-this-bay fee. A live key needs a Price ID we already have. Escrow stays refused.",
    genius: "sk_test_ → Stripe Checkout, founder can finish with 4242. sk_live_ → packet fee only if STRIPE_PACKET_PRICE_ID exists. Never escrow, shop cuts, or marketplace.",
    homeUrl: "https://dashboard.stripe.com/apikeys",
    connectUrl: "https://dashboard.stripe.com/apikeys",
    appPath: "/integrations",
    href: () => "/integrations",
  },
  {
    id: "contact-resend",
    stamp: "Mail",
    name: "Contact mailer",
    family: "licensed",
    lane: "env",
    env: "RESEND_API_KEY",
    dummy: "Both the mailer key and a to-address must be on to email. Missing either → a local ticket file.",
    genius: "RESEND_API_KEY + CONTACT_TO_EMAIL. We do not invent an inbox. Open /contact.",
    homeUrl: "/contact",
    connectUrl: "https://resend.com/api-keys",
    appPath: "/contact",
    href: () => "/contact",
  },
];

export const ALL_BAY_PIPES: IntegrationDef[] = [...INTEGRATIONS, ...EXTRA_PIPES];

export const EXTRA_STRIP_IDS = ["overpass", "quote-desk", "nicb-vincheck"] as const;

export function extraById(id: string): IntegrationDef | undefined {
  return EXTRA_PIPES.find((item) => item.id === id);
}
