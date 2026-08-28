import {
  VALUE_CONDITIONS,
  type ValueConditionId,
  type ValueIllustration,
  type ValueInput,
} from "@/lib/value/types";

const FIRST_YEAR_KEEP = 0.8;
const LATER_YEAR_KEEP = 0.9;
const MILES_PER_YEAR = 12_000;
const MILES_STEP = 10_000;
const MILES_STEP_WEIGHT = 0.035;
const BAND = 0.08;
const NEW_KEEP = 0.92;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function conditionFactor(id: ValueConditionId): number {
  return VALUE_CONDITIONS.find((row) => row.id === id)?.factor ?? 1;
}

export function ageKeepRate(ageYears: number): number {
  if (ageYears <= 0) return NEW_KEEP;
  return FIRST_YEAR_KEEP * Math.pow(LATER_YEAR_KEEP, ageYears - 1);
}

export function mileageFactor(mileage: number, expectedMiles: number): number {
  const steps = (mileage - expectedMiles) / MILES_STEP;
  return clamp(1 - steps * MILES_STEP_WEIGHT, 0.55, 1.2);
}

export function illustrateValue(input: ValueInput): ValueIllustration {
  const ageYears = Math.max(0, input.asOfYear - input.year);
  const expectedMiles = MILES_PER_YEAR * Math.max(ageYears, 1);
  const ageKeep = ageKeepRate(ageYears);
  const milesAdj = mileageFactor(input.mileage, expectedMiles);
  const cond = conditionFactor(input.condition);
  const mid = clamp(ageKeep * milesAdj * cond, 0.06, 0.92);
  const low = clamp(mid - BAND, 0.04, 0.95);
  const high = clamp(mid + BAND, 0.05, 0.96);
  const known = input.knownPrice && input.knownPrice > 0 ? input.knownPrice : null;

  return {
    year: input.year,
    make: input.make,
    model: input.model,
    mileage: input.mileage,
    condition: input.condition,
    asOfYear: input.asOfYear,
    ageYears,
    expectedMiles,
    ageKeep,
    mileageFactor: milesAdj,
    conditionFactor: cond,
    mid,
    low,
    high,
    midPct: pct(mid),
    lowPct: pct(low),
    highPct: pct(high),
    knownPrice: known,
    dollarLow: known ? Math.round(known * low) : null,
    dollarHigh: known ? Math.round(known * high) : null,
    dollarMid: known ? Math.round(known * mid) : null,
    steps: [
      {
        label: "Age",
        value:
          ageYears <= 0
            ? `Same-year car · keep ${pct(NEW_KEEP)} (not a new-car window sticker)`
            : `${ageYears} yr · first year keeps ${pct(FIRST_YEAR_KEEP)}, then × ${pct(LATER_YEAR_KEEP)} each year after → ${pct(ageKeep)}`,
      },
      {
        label: "Miles",
        value: `${input.mileage.toLocaleString()} vs ${expectedMiles.toLocaleString()} expected (${MILES_PER_YEAR.toLocaleString()}/yr) → × ${milesAdj.toFixed(3)}`,
      },
      {
        label: "Condition",
        value: `${input.condition} × ${cond.toFixed(2)}`,
      },
      {
        label: "Band",
        value: `${pct(low)} – ${pct(high)} of a new-car dollar (mid ${pct(mid)}, ±${Math.round(BAND * 100)} pts)`,
      },
      ...(known
        ? [
            {
              label: "Your number",
              value: `${money(known)} × band → ${money(Math.round(known * low))} – ${money(Math.round(known * high))}`,
            },
          ]
        : []),
    ],
    formula:
      "keep = first-year 80% × 90%^(age−1); × miles vs 12,000/yr (3.5% per 10k off); × condition; band = mid ± 8 points. Illustration — not a Cox / KBB / NADA residual.",
  };
}

export function parseYear(raw: string, asOfYear: number): number | null {
  const year = Number(String(raw).replace(/\D/g, ""));
  if (!Number.isFinite(year) || year < 1970 || year > asOfYear + 1) return null;
  return year;
}

export function parseMileage(raw: string): number | null {
  const miles = Number(String(raw).replace(/[,\s]/g, ""));
  if (!Number.isFinite(miles) || miles < 0 || miles > 1_000_000) return null;
  return Math.round(miles);
}

export function parseKnownPrice(raw: string): number | null {
  const cleaned = String(raw).replace(/[$,\s]/g, "");
  if (!cleaned) return null;
  const price = Number(cleaned);
  if (!Number.isFinite(price) || price <= 0 || price > 5_000_000) return null;
  return Math.round(price);
}

export function isConditionId(value: string): value is ValueConditionId {
  return VALUE_CONDITIONS.some((row) => row.id === value);
}
