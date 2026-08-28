import { CATALOG_DISCLAIMER, allJobs, getJob, jobSummaries } from "@/lib/labor/catalog";
import { compareQuote, parseQuotedTotal } from "@/lib/labor/compare";
import { dollars, formatRange } from "@/lib/labor/money";
import {
  EstimateError,
  HOURS_DISCLAIMER,
  LABOR_DISCLAIMER,
  type CatalogJob,
  type EstimatePayload,
  type EstimateQuery,
  type JobEstimate,
  type LaborBand,
  type LaborSide,
  type VehicleAdjust,
} from "@/lib/labor/types";
import { adjustVehicle, iceJobOnEv } from "@/lib/labor/vehicle";
import { NATIONAL_INDIE, allBands, zipBand } from "@/lib/labor/zip";

function scale(value: number, mult: number): number {
  return Math.round(value * mult * 10) / 10;
}

function laborSide(low: number, high: number, rateLow: number, rateHigh: number): LaborSide {
  return {
    low: dollars(low),
    high: dollars(high),
    rateLow: dollars(rateLow),
    rateHigh: dollars(rateHigh),
  };
}

function fillSay(template: string, high: number): string {
  return template.replaceAll("{high}", `$${dollars(high).toLocaleString("en-US")}`);
}

export function priceJob(job: CatalogJob, band: LaborBand, vehicle: VehicleAdjust): JobEstimate {
  if (iceJobOnEv(job.iceOnly, vehicle.ev)) {
    return {
      applicable: false,
      skipReason:
        "This car does not take that job. Use inspection, the 12-volt, brakes, calipers, or alignment.",
      parts: { low: 0, high: 0 },
      hours: { low: job.hoursLow, high: job.hoursHigh },
      laborMode: job.laborMode,
      labor: {
        indie: laborSide(0, 0, band.indieLow, band.indieHigh),
        dealer: laborSide(0, 0, band.dealerLow, band.dealerHigh),
      },
      total: { indie: { low: 0, high: 0 }, dealer: { low: 0, high: 0 } },
      beginnerRange: "Not this car",
      sayIfHigh: "Decline the ICE menu. Ask for the 12-volt test, tire date codes, and brake-fluid age.",
      notes: job.notes,
    };
  }

  const partsLow = dollars(job.partsLow * vehicle.partsMult);
  const partsHigh = dollars(job.partsHigh * vehicle.partsMult);
  const hoursLow = scale(job.hoursLow, vehicle.hoursMult);
  const hoursHigh = scale(job.hoursHigh, vehicle.hoursMult);

  let indieLaborLow: number;
  let indieLaborHigh: number;
  if (job.laborMode === "menu" && job.menuLow != null && job.menuHigh != null) {
    indieLaborLow = dollars(job.menuLow * (band.indieLow / NATIONAL_INDIE));
    indieLaborHigh = dollars(job.menuHigh * (band.indieHigh / NATIONAL_INDIE));
  } else {
    indieLaborLow = dollars(hoursLow * band.indieLow);
    indieLaborHigh = dollars(hoursHigh * band.indieHigh);
  }

  const dealerLaborLow = dollars(indieLaborLow * band.dealerMult);
  const dealerLaborHigh = dollars(indieLaborHigh * band.dealerMult);

  const indieLow = partsLow + indieLaborLow;
  const indieHigh = partsHigh + indieLaborHigh;
  const dealerLow = partsLow + dealerLaborLow;
  const dealerHigh = partsHigh + dealerLaborHigh;

  return {
    applicable: true,
    skipReason: null,
    parts: { low: partsLow, high: partsHigh },
    hours: { low: hoursLow, high: hoursHigh },
    laborMode: job.laborMode,
    labor: {
      indie: laborSide(indieLaborLow, indieLaborHigh, band.indieLow, band.indieHigh),
      dealer: laborSide(dealerLaborLow, dealerLaborHigh, band.dealerLow, band.dealerHigh),
    },
    total: {
      indie: { low: indieLow, high: indieHigh },
      dealer: { low: dealerLow, high: dealerHigh },
    },
    beginnerRange: formatRange(indieLow, indieHigh),
    sayIfHigh: fillSay(job.sayIfHigh, indieHigh),
    notes: job.notes,
  };
}

function quotedAmount(query: EstimateQuery): number | null {
  if (query.quoted?.trim()) {
    const parsed = parseQuotedTotal(query.quoted);
    if (parsed != null) return parsed;
  }
  if (query.quote?.trim()) return parseQuotedTotal(query.quote);
  return null;
}

export function buildEstimate(query: EstimateQuery): EstimatePayload {
  const vehicle = adjustVehicle(query.year ?? "", query.make ?? "", query.model ?? "");
  const jobKey = query.job?.trim() ?? "";
  const job = jobKey ? (getJob(jobKey) ?? null) : null;
  if (jobKey && !job) {
    throw new EstimateError(`Job is not in the catalog. Use one of: ${allJobs().map((row) => row.slug).join(", ")}.`);
  }

  const zipRaw = query.zip?.trim() ?? "";
  let zip = null;
  let band = null;
  if (zipRaw) {
    const mapped = zipBand(zipRaw);
    zip = mapped.mapping;
    band = mapped.band;
  } else if (job) {
    throw new EstimateError("Need a 5-digit US ZIP to price labor.");
  }

  let estimate: JobEstimate | null = null;
  if (job && band) {
    estimate = priceJob(job, band, vehicle);
  }

  const quoted = estimate?.applicable ? quotedAmount(query) : null;

  return {
    disclaimer: LABOR_DISCLAIMER,
    hoursDisclaimer: `${HOURS_DISCLAIMER} ${CATALOG_DISCLAIMER}`,
    jobs: jobSummaries(),
    bands: allBands(),
    zip,
    band,
    vehicle,
    job,
    estimate,
    compare: quoted != null && estimate ? compareQuote(quoted, estimate) : null,
  };
}

export function parseEstimateSearch(params: URLSearchParams): EstimateQuery {
  return {
    zip: params.get("zip") ?? undefined,
    job: params.get("job") ?? undefined,
    year: params.get("year") ?? undefined,
    make: params.get("make") ?? undefined,
    model: params.get("model") ?? undefined,
    quoted: params.get("quoted") ?? undefined,
    quote: params.get("quote") ?? undefined,
  };
}
