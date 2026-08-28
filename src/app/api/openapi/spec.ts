const FETCH = {
  status:
    "const r = await fetch('/api/integrations/status');\nconst j = await r.json();\n// weekend keys: configured === false unless the env is actually on (then probed:skip)\n// stripe: test packet Checkout; live needs price_; escrow false",
  nhtsa:
    "const r = await fetch('/api/integrations/nhtsa?kind=vin&vin=1HGCM82633A004352');\nconst { specs } = await r.json();",
  mpg: "const r = await fetch('/api/integrations/mpg?year=2003&make=Honda&model=Accord');\nconst { rows } = await r.json();",
  geocode: "const r = await fetch('/api/integrations/geocode?q=97214');\nconst pin = await r.json();",
  youtube:
    "const r = await fetch('/api/integrations/youtube?q=cabin+filter+how+to');\nconst { youtube, searchUrl } = await r.json();\n// no key → youtube.videos === [] ; use searchUrl",
  places:
    "const r = await fetch('/api/integrations/places?q=97214');\nconst { configured, results } = await r.json();\n// missing key → configured:false, results:[]",
  plate:
    "const r = await fetch('/api/integrations/plate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plate: 'ABC123', state: 'OR' }) });\nconst j = await r.json();\n// no key → vin:null — we do not invent a VIN",
  vin: "const r = await fetch('/api/vin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vin: '1HGCM82633A004352' }) });\nconst { specs } = await r.json();",
  fluids: "const r = await fetch('/api/fluids?year=2003&make=Honda&model=Accord');\nconst { fluids } = await r.json();",
  agent:
    "const r = await fetch('/api/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: 'P0420 on a 2003 Honda Accord' }], readingLevel: 'beginner' }) });\nconst brief = await r.json();",
};

function get(tag: string, summary: string, description: string, fetch?: string) {
  return {
    get: {
      tags: [tag],
      summary,
      description,
      ...(fetch ? { "x-openhood-fetch": fetch } : {}),
      responses: { "200": { description: "JSON" }, "400": { description: "Bad input" }, "502": { description: "Upstream" } },
    },
  };
}

export const OPENAPI_SPEC = {
  openapi: "3.1.0",
  info: {
    title: "Open Hood public API",
    version: "1.1.0",
    summary: "Consumer advocate — VIN, quotes, shops, recalls, integrations. Native fetch only.",
    description:
      "Public routes that exist on this origin. POST /api/agent runs bay tools then writes a Beginner or Expert brief. GET /api/integrations/status is the honesty matrix: public probes, weekend keys configured:false when missing (probed:skip when on), Stripe test packet Checkout, live packet only with an existing Price ID, escrow refused. GET /agent/api renders this spec. Not a shop booking API. Not TecDoc. Not a Carfax feed.",
  },
  servers: [{ url: "/", description: "Same origin as the bay" }],
  tags: [
    { name: "Advocate", description: "Advocate desk + bay tools" },
    { name: "Integrations", description: "Patch bay, probes, honest no-op adapters" },
    { name: "Vehicle", description: "VIN, fluids, catalog menus" },
    { name: "Shops", description: "Directory / maps. Overpass is a separate desk." },
    { name: "Ticket", description: "Quote, estimate, history, trust, contact" },
    { name: "Spec", description: "This OpenAPI document" },
  ],
  paths: {
    "/api/agent": {
      get: {
        tags: ["Advocate"],
        operationId: "getAgentStatus",
        summary: "Desk status and tool list",
        description: "Whether the optional photo connection is on, callable tool names, reading levels beginner | expert.",
        responses: { "200": { description: "Status" } },
      },
      post: {
        tags: ["Advocate"],
        operationId: "postAgent",
        summary: "Ask the advocate",
        description: "Messages, optional vehicle, beginner|expert, optional image. Native fetch. JSON or SSE.",
        "x-openhood-fetch": FETCH.agent,
        responses: { "200": { description: "JSON brief or SSE" }, "400": { description: "Missing messages" } },
      },
    },
    "/api/openapi": {
      get: {
        tags: ["Spec"],
        operationId: "getOpenApi",
        summary: "OpenAPI 3.1 document",
        description: "yaml (default) or ?format=json. Same contract as /openapi.yaml.",
        parameters: [{ name: "format", in: "query", schema: { type: "string", enum: ["yaml", "json"] } }],
        responses: { "200": { description: "OpenAPI 3.1" } },
      },
    },
    "/api/integrations/status": {
      get: {
        tags: ["Integrations"],
        operationId: "getIntegrationsStatus",
        summary: "Honesty matrix + public probes",
        description:
          "Every jack. Live probes for NHTSA vPIC, Nominatim, FuelEconomy.gov. recallsByVin probe is 403. Paid keys: configured:false unless the adapter is wired and the env is on (then probed:skip — we do not hammer paid APIs). Chrome / MOTOR / TecDoc stay false. Stripe: test → configured true, product none; live → liveKeyDetected, product none, escrow refused. ?probe=0 skips upstream probes.",
        "x-openhood-fetch": FETCH.status,
        responses: { "200": { description: "Matrix, keys, probes, stripe, licensed empty catalog" } },
      },
    },
    "/api/integrations/nhtsa": {
      get: {
        tags: ["Integrations"],
        operationId: "getIntegrationsNhtsa",
        summary: "vPIC / SaferCar / NCAP / complaints",
        description: "kind=vin|vin-campaign|recallsByVin|recalls|complaints|ratings. recallsByVin reports the 403. No HTML scrape.",
        "x-openhood-fetch": FETCH.nhtsa,
        responses: { "200": { description: "Decode or campaigns" }, "400": { description: "Need VIN or Y/M/M" } },
      },
    },
    "/api/integrations/mpg": get("Integrations", "EPA FuelEconomy.gov MPG", "Official city / hwy / combined. No key.", FETCH.mpg),
    "/api/integrations/geocode": get("Integrations", "Nominatim pin", "ZIP or city → lat/lon. User-Agent required. 1 req/s.", FETCH.geocode),
    "/api/integrations/youtube": get("Integrations", "YouTube how-to", "No scrape. Key off → videos:[], searchUrl still works.", FETCH.youtube),
    "/api/integrations/links": get("Integrations", "Computed outbound hrefs", "Every jack’s Open / Connect / Request access URL for the ticket context."),
    "/api/integrations/places": get("Integrations", "Google Places adapter", "Missing key → configured:false, results:[]. No invented shops.", FETCH.places),
    "/api/integrations/yelp": get("Integrations", "Yelp Fusion adapter", "Missing key → configured:false, results:[]. No invented stars."),
    "/api/integrations/plate": {
      get: {
        tags: ["Integrations"],
        summary: "Plate-to-VIN status",
        description: "CarsXE / MarketCheck. Off → configured:false. Plate stays a note.",
        responses: { "200": { description: "Status" } },
      },
      post: {
        tags: ["Integrations"],
        summary: "Plate-to-VIN (no-op without keys)",
        description: "JSON {plate, state}. No key → vin:null. We do not invent a VIN, shop, or price.",
        "x-openhood-fetch": FETCH.plate,
        responses: { "200": { description: "Decode or honest dark body" } },
      },
    },
    "/api/integrations/openai": get("Integrations", "Photo reading status", "GET only. Does not call OpenAI. configured:false without OPENAI_API_KEY."),
    "/api/integrations/chrome": get("Integrations", "Chrome Data stub", "Always connected:false. No fake window sticker. ROADMAP after contract."),
    "/api/integrations/motor": get("Integrations", "MOTOR / Identifix stub", "Always configured:false. No Motor client. No invented hours. ROADMAP."),
    "/api/integrations/stripe": get("Integrations", "Stripe test vs live vs none", "sk_test_ → configured true, product:packet, Checkout. sk_live_ → packet fee only with STRIPE_PACKET_PRICE_ID. Escrow, shop cuts, marketplace refused."),
    "/api/integrations/catalog": get("Integrations", "Licensed catalog empty bay", "skus:[], hours:[], tecdoc/motor/partstech/chrome false. Contract names + ROADMAP. No fake SKUs. OSM stays the shop map."),
    "/api/integrations/partstech": get("Integrations", "PartsTech empty adapter", "Always connected:false, skus:[]. PartsTech shop parts book. ROADMAP."),
    "/api/integrations/vinaudit": get("Integrations", "VinAudit weekend key", "configured:true only with VINAUDIT_API_KEY. Title snapshot on /history. Never a dummy Carfax."),
    "/api/stripe/packet": {
      get: {
        tags: ["Integrations"],
        summary: "Packet fee status",
        description: "Optional print packet / hold this bay. Test vs live vs none. Escrow refused.",
        responses: { "200": { description: "Status or session" } },
      },
      post: {
        tags: ["Integrations"],
        summary: "Open packet Checkout",
        description: "sk_test_ or sk_live_ + existing price_. Founder can complete a test payment. Not escrow.",
        responses: { "200": { description: "Checkout URL" }, "403": { description: "Live without product" }, "404": { description: "No key" } },
      },
    },
    "/api/vin": {
      post: {
        tags: ["Vehicle"],
        summary: "Decode a VIN",
        description: "NHTSA vPIC + nameplate recalls + fluids card. Native fetch.",
        "x-openhood-fetch": FETCH.vin,
        responses: { "200": { description: "specs, fluids, recalls" } },
      },
    },
    "/api/identify": {
      post: {
        tags: ["Vehicle"],
        summary: "Identify from VIN or year/make/model",
        description: "Plate rides as a note. Plate-to-VIN is a different jack.",
        responses: { "200": { description: "Identity packet" } },
      },
    },
    "/api/fluids": get("Vehicle", "Fluids / PSI card", "Door jamb still wins a catalog miss.", FETCH.fluids),
    "/api/catalog": get("Vehicle", "Year / make / model menus", "NHTSA vPIC menus. Not TecDoc."),
    "/api/quote": {
      post: {
        tags: ["Ticket"],
        summary: "Mark up a repair order",
        description: "Local price book. Photo vision only when OPENAI_API_KEY is on.",
        responses: { "200": { description: "Marked ticket" } },
      },
    },
    "/api/estimate": get("Ticket", "ZIP labor band", "Heuristic hours. Not Motor. Not Mitchell."),
    "/api/directory/search": get("Shops", "Overpass rooftops", "Owned by the directory desk. This spec only documents the public GET."),
    "/api/directory/geocode": get("Shops", "Directory Nominatim", "Same public geocoder as /api/integrations/geocode."),
    "/api/directory/places": get("Shops", "Places / Yelp merge", "Missing keys → connected:false, results:[]. OSM is a separate sweep."),
    "/api/directory/catalog": get("Shops", "Directory provider catalog", "Machine list + env flags. Licensed jacks stay honest."),
    "/api/history": get("Ticket", "History dossier", "NHTSA identity + campaigns + consumer report link-outs. No Carfax XML."),
    "/api/history/title": {
      get: {
        tags: ["Ticket"],
        summary: "Paid title snapshot status",
        description: "VinAudit or CarsXE history only if that env key is on. Off → empty bay. Not a Carfax file. Not Consumer Reports.",
        responses: { "200": { description: "Status or snapshot" } },
      },
      post: {
        tags: ["Ticket"],
        summary: "Paid title snapshot",
        description: "JSON { vin }. No key → empty. Key on → named vendor. We do not invent wrecks.",
        responses: { "200": { description: "Snapshot or empty bay" } },
      },
    },
    "/api/history/plate": {
      get: {
        tags: ["Ticket"],
        summary: "History plate status",
        responses: { "200": { description: "Dark or live" } },
      },
      post: {
        tags: ["Ticket"],
        summary: "History plate decode",
        description: "Same honesty as /api/integrations/plate.",
        responses: { "200": { description: "Decode or note" } },
      },
    },
    "/api/contact": {
      get: {
        tags: ["Ticket"],
        summary: "Contact mailer status",
        description: "RESEND_API_KEY + CONTACT_TO_EMAIL or local JSONL.",
        responses: { "200": { description: "delivery email|local" } },
      },
      post: {
        tags: ["Ticket"],
        summary: "Submit a contact ticket",
        responses: { "200": { description: "Filed" } },
      },
    },
    "/api/trust": get("Ticket", "Trust desk status", "No users in this repo. Hold is test-or-demo."),
    "/api/trust/hold": {
      get: {
        tags: ["Ticket"],
        summary: "Hold status",
        description: "sk_live_ refused. Not escrow.",
        responses: { "200": { description: "Hold mode" } },
      },
    },
    "/api/ocr": {
      post: {
        tags: ["Vehicle"],
        summary: "Photo OCR",
        description: "OPENAI vision is the primary RO reader when OPENAI_API_KEY is set (usedCloud:true). Off → Tesseract lottery on the device. Typical-hour book, not a licensed hour guide.",
        responses: { "200": { description: "Read text" } },
      },
    },
    "/api/symptoms": get("Advocate", "Symptom map", "Noise + when → shop questions."),
    "/api/guides": get("Advocate", "Guide glossary", "Owner how-to jobs."),
    "/api/finder": get("Advocate", "Parts finder", "Job → storefront search URLs. Not live stock."),
    "/api/expert/playbooks": get("Advocate", "Owner playbooks", "Not stolen TSB PDFs."),
    "/api/auctions/search": get("Advocate", "Auction link-outs", "No lot scrape."),
    "/api/book": get("Ticket", "Visit packet", "We do not write the dealer RO."),
    "/api/jobs/dtc": get("Advocate", "DTC book", "?code=P0420"),
    "/agent": {
      get: { tags: ["Advocate"], summary: "Advocate desk", description: "HTML. Not an API.", responses: { "200": { description: "HTML" } } },
    },
    "/agent/api": {
      get: { tags: ["Spec"], summary: "Readable OpenAPI view", responses: { "200": { description: "HTML docs" } } },
    },
    "/integrations": {
      get: { tags: ["Integrations"], summary: "Patch bay", description: "HTML honesty board.", responses: { "200": { description: "HTML" } } },
    },
  },
  "x-openhood-tools": {
    decode_vin: "NHTSA vPIC. 17-character VIN.",
    lookup_dtc: "Local DTC book plus generic SAE layout.",
    analyze_quote_text: "Local quote book. Flags flushes and padded lines.",
    diagnose_symptoms: "Noise plus when maps to shop questions.",
    get_fluids_for_vehicle: "Catalog or heuristic fluids card.",
    search_guides: "Owner guide glossary.",
    search_directory: "ZIP plus type to OSM rooftops. No booking.",
    get_recalls: "NHTSA year/make/model campaigns. Not VIN open/closed.",
    get_epa_mpg: "FuelEconomy.gov official MPG.",
    search_playbooks: "Named owner playbooks. Not a stolen TSB.",
    lookup_ro_term: "Invoice slang. Not legal advice.",
    search_parts: "Outbound catalog search URLs. Not TecDoc. Not live stock.",
  },
} as const;

function yamlScalar(value: string): string {
  if (value === "") return '""';
  if (/[:#{}[\],&*?|<>=!%@`]/.test(value) || /\n/.test(value) || /^(true|false|null|\d)/i.test(value)) {
    if (value.includes("\n")) {
      return `|\n${value
        .split("\n")
        .map((line) => `  ${line}`)
        .join("\n")}`;
    }
    return JSON.stringify(value);
  }
  return value;
}

function toYaml(value: unknown, indent = 0): string {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") return yamlScalar(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value
      .map((item) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const inner = toYaml(item, indent + 1);
          const lines = inner.split("\n");
          return `${pad}- ${lines[0].trimStart()}${lines.length > 1 ? `\n${lines.slice(1).join("\n")}` : ""}`;
        }
        return `${pad}- ${toYaml(item, 0)}`;
      })
      .join("\n");
  }
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return "{}";
  return entries
    .map(([key, child]) => {
      if (child && typeof child === "object") {
        const inner = toYaml(child, indent + 1);
        if (inner === "[]" || inner === "{}") return `${pad}${key}: ${inner}`;
        return `${pad}${key}:\n${inner}`;
      }
      const rendered = toYaml(child, 0);
      if (typeof child === "string" && child.includes("\n") && rendered.startsWith("|")) {
        const body = rendered.slice(2);
        const nested = body
          .split("\n")
          .map((line) => `${"  ".repeat(indent + 1)}${line.replace(/^  /, "")}`)
          .join("\n");
        return `${pad}${key}: |\n${nested}`;
      }
      return `${pad}${key}: ${rendered}`;
    })
    .join("\n");
}

export function renderOpenApiYaml(): string {
  return `${toYaml(OPENAPI_SPEC)}\n`;
}
