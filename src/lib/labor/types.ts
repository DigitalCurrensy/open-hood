export const ESTIMATE_ROUTE = "/estimate" as const;
export const ESTIMATE_API_PATH = "/api/estimate" as const;

export const LABOR_DISCLAIMER =
  "Band from regional averages, not a licensed Motor guide." as const;

export const HOURS_DISCLAIMER =
  "Hours are typical times for a common passenger car — not a Mitchell or Motor subscription." as const;

export type LaborBandId = "rural" | "midwest" | "sunbelt" | "mountain" | "coast";

export type ZipMatchKind = "zip3" | "zip2" | "digit";

export type JobKind = "priced" | "note";

export type LaborMode = "hours" | "menu";

export type JobFamily = "service" | "brakes" | "electrical" | "engine" | "steering" | "diag";

export type QuoteVerdict = "below" | "within-indie" | "above-indie" | "above-dealer";

export interface CatalogJob {
  id: string;
  slug: string;
  stamp: string;
  label: string;
  family: JobFamily;
  scope: string;
  kind: JobKind;
  iceOnly: boolean;
  laborMode: LaborMode;
  partsLow: number;
  partsHigh: number;
  hoursLow: number;
  hoursHigh: number;
  menuLow?: number;
  menuHigh?: number;
  aliases: string[];
  notes: string;
  sayIfHigh: string;
}

export interface JobCatalogFile {
  disclaimer: string;
  jobs: CatalogJob[];
}

export interface LaborBand {
  id: LaborBandId;
  label: string;
  region: string;
  indieLow: number;
  indieHigh: number;
  dealerLow: number;
  dealerHigh: number;
  indieMult: number;
  dealerMult: number;
}

export interface LaborZipBandsFile {
  disclaimer: string;
  nationalIndie: number;
  bands: Record<LaborBandId, LaborBand>;
  digitDefaults: Record<string, LaborBandId>;
  prefixes: Record<string, LaborBandId>;
}

export interface ZipMapping {
  input: string;
  zip: string;
  prefix: string;
  match: ZipMatchKind;
  bandId: LaborBandId;
  steps: string[];
}

export interface VehicleAdjust {
  year: string;
  make: string;
  model: string;
  partsMult: number;
  hoursMult: number;
  ev: boolean;
  notes: string[];
}

export interface MoneyRange {
  low: number;
  high: number;
}

export interface LaborSide {
  low: number;
  high: number;
  rateLow: number;
  rateHigh: number;
}

export interface JobEstimate {
  applicable: boolean;
  skipReason: string | null;
  parts: MoneyRange;
  hours: MoneyRange;
  laborMode: LaborMode;
  labor: {
    indie: LaborSide;
    dealer: LaborSide;
  };
  total: {
    indie: MoneyRange;
    dealer: MoneyRange;
  };
  beginnerRange: string;
  sayIfHigh: string;
  notes: string;
}

export interface QuoteCompare {
  quoted: number;
  versusIndieHigh: number;
  versusDealerHigh: number;
  verdict: QuoteVerdict;
  say: string;
}

export interface JobSummary {
  id: string;
  slug: string;
  stamp: string;
  label: string;
  family: JobFamily;
  scope: string;
  kind: JobKind;
  iceOnly: boolean;
  partsLow: number;
  partsHigh: number;
  hoursLow: number;
  hoursHigh: number;
  laborMode: LaborMode;
}

export interface EstimatePayload {
  disclaimer: string;
  hoursDisclaimer: string;
  jobs: JobSummary[];
  bands: LaborBand[];
  zip: ZipMapping | null;
  band: LaborBand | null;
  vehicle: VehicleAdjust;
  job: CatalogJob | null;
  estimate: JobEstimate | null;
  compare: QuoteCompare | null;
}

export interface EstimateQuery {
  zip?: string;
  job?: string;
  year?: string;
  make?: string;
  model?: string;
  quoted?: string;
  quote?: string;
}

export class EstimateError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "EstimateError";
    this.status = status;
  }
}
