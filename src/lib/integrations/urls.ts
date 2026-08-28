import type { IntegrationContext } from "@/lib/integrations/types";

export function enc(value: string): string {
  return encodeURIComponent(value.trim());
}

export function ymmQuery(ctx: Pick<IntegrationContext, "year" | "make" | "model">): string {
  return [ctx.year, ctx.make, ctx.model].map((part) => part.trim()).filter(Boolean).join(" ");
}

export function partsQuery(ctx: IntegrationContext): string {
  return [ymmQuery(ctx), ctx.part.trim() || "oil filter"].filter(Boolean).join(" ").trim();
}

export function howToQuery(ctx: IntegrationContext): string {
  const job = ctx.howTo.trim() || ctx.part.trim() || "cabin filter";
  const vehicle = ymmQuery(ctx);
  return [vehicle, job, "how to"].filter(Boolean).join(" ");
}

function lowerSlug(value: string, joiner: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, joiner)
    .replace(new RegExp(`^\\${joiner}|\\${joiner}$`, "g"), "");
}

export const URLS = {
  nhtsaVinDecoder: "https://vpic.nhtsa.dot.gov/decoder",
  nhtsaRecalls: "https://www.nhtsa.gov/recalls",
  nhtsaRatings: "https://www.nhtsa.gov/ratings",
  nhtsaSearch: "https://www.nhtsa.gov/search",
  epaFindACar: "https://www.fueleconomy.gov/feg/findacar.shtml",
  epaHome: "https://www.fueleconomy.gov/",
  osmSearch: "https://www.openstreetmap.org/search",
  nominatimUi: "https://nominatim.openstreetmap.org/ui/search.html",
  youtubeSearch: "https://www.youtube.com/results",
  iihsRatings: "https://www.iihs.org/ratings",
  carfaxHome: "https://www.carfax.com/vehicle-history-reports/",
  carfaxVin: "https://www.carfax.com/vin/",
  repairPal: "https://repairpal.com/",
  repairPalEstimator: "https://repairpal.com/estimator",
  yelpSearch: "https://www.yelp.com/search",
  fuelly: "https://www.fuelly.com/",
  googleMaps: "https://www.google.com/maps",
  appleMaps: "https://maps.apple.com/",
  rockauto: "https://www.rockauto.com/en/catalog/",
  autozone: "https://www.autozone.com/searchresult",
  advance: "https://shop.advanceautoparts.com/web/SearchResults",
  oreilly: "https://www.oreillyauto.com/search",
  amazon: "https://www.amazon.com/s",
  ebayMotors: "https://www.ebay.com/sch/6000/i.html",
  bat: "https://bringatrailer.com/",
  carsBids: "https://carsandbids.com/search",
  copart: "https://www.copart.com/lotSearchResults",
  iaa: "https://www.iaai.com/Search",
} as const;

export function nhtsaVinDecoderUrl(): string {
  return URLS.nhtsaVinDecoder;
}

export function nhtsaRecallsUrl(ctx: IntegrationContext): string {
  if (ctx.vin.trim()) return `https://www.nhtsa.gov/recalls?vin=${enc(ctx.vin)}`;
  const vehicle = ymmQuery(ctx);
  if (vehicle) return `https://www.nhtsa.gov/search?q=${enc(`${vehicle} recall`)}`;
  return URLS.nhtsaRecalls;
}

export function nhtsaVehicleUrl(ctx: IntegrationContext): string {
  const vehicle = ymmQuery(ctx);
  if (vehicle) return `https://www.nhtsa.gov/search?q=${enc(`${vehicle} safety ratings`)}`;
  return URLS.nhtsaRatings;
}

export function nhtsaComplaintsUrl(ctx: IntegrationContext): string {
  const vehicle = ymmQuery(ctx);
  if (vehicle) return `https://www.nhtsa.gov/search?q=${enc(`${vehicle} complaints`)}`;
  return URLS.nhtsaSearch;
}

export function epaFindACarUrl(ctx: IntegrationContext): string {
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
  return URLS.epaFindACar;
}

export function nominatimUrl(ctx: IntegrationContext): string {
  const q = ctx.address.trim() || ymmQuery(ctx) || "Los Angeles CA";
  return `${URLS.nominatimUi}?q=${enc(q)}`;
}

export function osmSearchUrl(ctx: IntegrationContext): string {
  const q = ctx.address.trim() || "auto repair";
  return `${URLS.osmSearch}?query=${enc(q)}`;
}

export function directoryUrl(ctx: IntegrationContext): string {
  const q = ctx.address.trim();
  if (!q) return "/directory";
  if (/^\d{5}(?:-\d{4})?$/.test(q)) return `/directory/${q}`;
  return `/directory?q=${enc(q)}`;
}

export function youtubeHowToUrl(ctx: IntegrationContext): string {
  return `${URLS.youtubeSearch}?search_query=${enc(howToQuery(ctx))}`;
}

export function guidesUrl(ctx: IntegrationContext): string {
  const q = ctx.howTo.trim() || ctx.part.trim();
  return q ? `/guides?q=${enc(q)}` : "/guides";
}

export function rockautoUrl(ctx: IntegrationContext): string {
  if (ctx.year && ctx.make && ctx.model) {
    const make = lowerSlug(ctx.make, "");
    const model = lowerSlug(ctx.model, "");
    if (make && model) {
      return `https://www.rockauto.com/en/catalog/${encodeURIComponent(make)},${enc(ctx.year)},${encodeURIComponent(model)}`;
    }
  }
  const q = partsQuery(ctx);
  return q ? `https://www.rockauto.com/en/partsearch/?partnum=${enc(q)}` : URLS.rockauto;
}

export function autozoneUrl(ctx: IntegrationContext): string {
  return `${URLS.autozone}?searchText=${enc(partsQuery(ctx))}`;
}

export function advanceUrl(ctx: IntegrationContext): string {
  return `${URLS.advance}?searchTerm=${enc(partsQuery(ctx))}`;
}

export function oreillyUrl(ctx: IntegrationContext): string {
  return `${URLS.oreilly}?q=${enc(partsQuery(ctx))}`;
}

export function amazonUrl(ctx: IntegrationContext): string {
  return `${URLS.amazon}?k=${enc(partsQuery(ctx))}`;
}

export function ebayMotorsUrl(ctx: IntegrationContext): string {
  return `${URLS.ebayMotors}?_nkw=${enc(partsQuery(ctx))}`;
}

export function googleMapsDirUrl(ctx: IntegrationContext): string {
  const dest = ctx.address.trim();
  if (dest) return `https://www.google.com/maps/dir/?api=1&destination=${enc(dest)}`;
  return URLS.googleMaps;
}

export function appleMapsDirUrl(ctx: IntegrationContext): string {
  const dest = ctx.address.trim();
  if (dest) return `https://maps.apple.com/?daddr=${enc(dest)}`;
  return URLS.appleMaps;
}

export function iihsRatingsUrl(): string {
  return URLS.iihsRatings;
}

export function carfaxUrl(): string {
  return URLS.carfaxHome;
}

export function repairPalUrl(ctx: IntegrationContext): string {
  if (ctx.make && ctx.model) {
    return `https://repairpal.com/${lowerSlug(ctx.make, "-")}/${lowerSlug(ctx.model, "-")}`;
  }
  return URLS.repairPalEstimator;
}

export function yelpShopUrl(ctx: IntegrationContext): string {
  const loc = ctx.address.trim() || "near me";
  const desc = ctx.make.trim() ? `${ctx.make.trim()} auto repair` : "auto repair";
  return `${URLS.yelpSearch}?find_desc=${enc(desc)}&find_loc=${enc(loc)}`;
}

export function fuellyUrl(ctx: IntegrationContext): string {
  if (ctx.make && ctx.model) {
    const make = lowerSlug(ctx.make, "_");
    const model = lowerSlug(ctx.model, "_");
    const year = ctx.year.trim();
    const path = year ? `${make}/${model}/${year}` : `${make}/${model}`;
    return `https://www.fuelly.com/car/${path}`;
  }
  return URLS.fuelly;
}

export function batUrl(ctx: IntegrationContext): string {
  const q = ymmQuery(ctx);
  return q ? `https://bringatrailer.com/?s=${enc(q)}` : URLS.bat;
}

export function carsBidsUrl(ctx: IntegrationContext): string {
  const q = ymmQuery(ctx);
  return q ? `https://carsandbids.com/search?q=${enc(q)}` : URLS.carsBids;
}

export function copartUrl(ctx: IntegrationContext): string {
  const q = ymmQuery(ctx);
  return q
    ? `https://www.copart.com/lotSearchResults?free=true&query=${enc(q)}`
    : "https://www.copart.com/";
}

export function iaaUrl(ctx: IntegrationContext): string {
  const q = ymmQuery(ctx);
  return q ? `https://www.iaai.com/Search?search=${enc(q)}` : "https://www.iaai.com/";
}
