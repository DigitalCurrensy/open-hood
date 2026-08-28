import { US_STATES } from "@/lib/us-states";
import { isValidVin, normalizeVin } from "@/lib/vin";

/** Key-free honesty. Format is not a DMV hit and never invents a VIN. */
export const PLATE_FORMAT_HONESTY =
  "State plate pattern only. Format OK is not a registration. We never invent a VIN. CarsXE stays {connected:false} without a paid key.";

export const PLATE_NOT_VIN_STAMP = "That is not a plate we recognize — still a note, not a VIN.";

export type PlateFormatVerdict = "empty" | "looks-like-vin" | "match" | "plate-shaped" | "unrecognized";

export interface PlateFormatResult {
  plate: string;
  state: string;
  stateName: string;
  verdict: PlateFormatVerdict;
  matchedId: string;
  recognized: boolean;
  inventedVin: false;
  stamp: string;
  note: string;
}

interface PlateSeries {
  id: string;
  pattern: RegExp;
}

interface StatePlateSpec {
  code: string;
  series: PlateSeries[];
}

function series(id: string, pattern: RegExp): PlateSeries {
  return { id, pattern };
}

/**
 * Standard passenger (and a few long-running prior) series.
 * Vanity / specialty plates are intentionally unrecognized — still a note.
 */
const STATE_SERIES: readonly StatePlateSpec[] = [
  {
    code: "AL",
    series: [series("al-0ab1234", /^[0-9][A-Z]{2}[0-9]{4}$/), series("al-abc1234", /^[A-Z]{3}[0-9]{4}$/)],
  },
  {
    code: "AK",
    series: [series("ak-abc123", /^[A-Z]{3}[0-9]{3}$/), series("ak-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "AZ",
    series: [series("az-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("az-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "AR",
    series: [series("ar-123abc", /^[0-9]{3}[A-Z]{3}$/), series("ar-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "CA",
    series: [
      series("ca-1abc123", /^[1-9][A-Z]{3}[0-9]{3}$/),
      series("ca-abc1234", /^[A-Z]{3}[0-9]{4}$/),
      series("ca-123abc", /^[0-9]{3}[A-Z]{3}$/),
    ],
  },
  {
    code: "CO",
    series: [series("co-abc-d12", /^[A-Z]{3}[A-Z][0-9]{2}$/), series("co-123-abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "CT",
    series: [series("ct-ab12345", /^[A-Z]{2}[0-9]{5}$/), series("ct-1ab-cd2", /^[0-9][A-Z]{2}[A-Z]{2}[0-9]$/)],
  },
  { code: "DE", series: [series("de-numeric", /^[0-9]{3,7}$/)] },
  { code: "DC", series: [series("dc-ab1234", /^[A-Z]{2}[0-9]{4}$/), series("dc-abc123", /^[A-Z]{3}[0-9]{3}$/)] },
  {
    code: "FL",
    series: [
      series("fl-abcd12", /^[A-Z]{4}[0-9]{2}$/),
      series("fl-a12bcd", /^[A-Z][0-9]{2}[A-Z]{3}$/),
      series("fl-123abc", /^[0-9]{3}[A-Z]{3}$/),
      series("fl-abc123", /^[A-Z]{3}[0-9]{3}$/),
    ],
  },
  {
    code: "GA",
    series: [series("ga-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("ga-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "HI",
    series: [series("hi-abc123", /^[A-Z]{3}[0-9]{3}$/), series("hi-1abc23", /^[0-9][A-Z]{3}[0-9]{2}$/)],
  },
  {
    code: "ID",
    series: [series("id-a123456", /^[A-Z][0-9]{6}$/), series("id-1a12345", /^[0-9][A-Z][0-9]{5}$/)],
  },
  {
    code: "IL",
    series: [
      series("il-ab12345", /^[A-Z]{2}[0-9]{5}$/),
      series("il-abc1234", /^[A-Z]{3}[0-9]{4}$/),
      series("il-123abc", /^[0-9]{3}[A-Z]{3}$/),
    ],
  },
  {
    code: "IN",
    series: [series("in-123abc", /^[0-9]{3}[A-Z]{3}$/), series("in-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "IA",
    series: [series("ia-abc123", /^[A-Z]{3}[0-9]{3}$/), series("ia-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "KS",
    series: [series("ks-123abc", /^[0-9]{3}[A-Z]{3}$/), series("ks-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "KY",
    series: [series("ky-123abc", /^[0-9]{3}[A-Z]{3}$/), series("ky-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "LA",
    series: [series("la-123abc", /^[0-9]{3}[A-Z]{3}$/), series("la-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  { code: "ME", series: [series("me-1234ab", /^[0-9]{4}[A-Z]{2}$/), series("me-abc123", /^[A-Z]{3}[0-9]{3}$/)] },
  {
    code: "MD",
    series: [series("md-1ab2345", /^[0-9][A-Z]{2}[0-9]{4}$/), series("md-abc1234", /^[A-Z]{3}[0-9]{4}$/)],
  },
  {
    code: "MA",
    series: [
      series("ma-1abc23", /^[0-9][A-Z]{3}[0-9]{2}$/),
      series("ma-123abc", /^[0-9]{3}[A-Z]{3}$/),
      series("ma-abc123", /^[A-Z]{3}[0-9]{3}$/),
    ],
  },
  {
    code: "MI",
    series: [series("mi-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("mi-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "MN",
    series: [series("mn-123abc", /^[0-9]{3}[A-Z]{3}$/), series("mn-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "MS",
    series: [series("ms-abc123", /^[A-Z]{3}[0-9]{3}$/), series("ms-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "MO",
    series: [series("mo-a12b3c", /^[A-Z][0-9]{2}[A-Z][0-9][A-Z]$/), series("mo-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "MT",
    series: [series("mt-1-12345a", /^[0-9][0-9]{5}[A-Z]$/), series("mt-123-456a", /^[0-9]{6}[A-Z]$/)],
  },
  {
    code: "NE",
    series: [series("ne-abc123", /^[A-Z]{3}[0-9]{3}$/), series("ne-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  { code: "NV", series: [series("nv-123a456", /^[0-9]{3}[A-Z][0-9]{3}$/), series("nv-abc123", /^[A-Z]{3}[0-9]{3}$/)] },
  { code: "NH", series: [series("nh-numeric", /^[0-9]{5,7}$/), series("nh-123abcd", /^[0-9]{3}[A-Z]{4}$/)] },
  {
    code: "NJ",
    series: [
      series("nj-a12bcd", /^[A-Z][0-9]{2}[A-Z]{3}$/),
      series("nj-abc1234", /^[A-Z]{3}[0-9]{4}$/),
      series("nj-d12-abc", /^[A-Z][0-9]{2}[A-Z]{3}$/),
    ],
  },
  {
    code: "NM",
    series: [series("nm-123abc", /^[0-9]{3}[A-Z]{3}$/), series("nm-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "NY",
    series: [
      series("ny-abc1234", /^[A-Z]{3}[0-9]{4}$/),
      series("ny-abc123", /^[A-Z]{3}[0-9]{3}$/),
      series("ny-1abc123", /^[0-9][A-Z]{3}[0-9]{3}$/),
      series("ny-123abc", /^[0-9]{3}[A-Z]{3}$/),
    ],
  },
  {
    code: "NC",
    series: [series("nc-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("nc-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "ND",
    series: [series("nd-123abc", /^[0-9]{3}[A-Z]{3}$/), series("nd-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "OH",
    series: [series("oh-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("oh-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "OK",
    series: [series("ok-abc123", /^[A-Z]{3}[0-9]{3}$/), series("ok-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "OR",
    series: [series("or-123abc", /^[0-9]{3}[A-Z]{3}$/), series("or-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "PA",
    series: [series("pa-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("pa-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  { code: "RI", series: [series("ri-numeric", /^[0-9]{5,6}$/), series("ri-ab123", /^[A-Z]{2}[0-9]{3}$/)] },
  {
    code: "SC",
    series: [series("sc-abc123", /^[A-Z]{3}[0-9]{3}$/), series("sc-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "SD",
    series: [series("sd-1ab123", /^[0-9][A-Z]{2}[0-9]{3}$/), series("sd-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "TN",
    series: [
      series("tn-1a23b4", /^[0-9][A-Z][0-9]{2}[A-Z][0-9]$/),
      series("tn-abc1234", /^[A-Z]{3}[0-9]{4}$/),
    ],
  },
  {
    code: "TX",
    series: [
      series("tx-abc1234", /^[A-Z]{3}[0-9]{4}$/),
      series("tx-abc123", /^[A-Z]{3}[0-9]{3}$/),
      series("tx-123abc", /^[0-9]{3}[A-Z]{3}$/),
    ],
  },
  {
    code: "UT",
    series: [series("ut-a123bc", /^[A-Z][0-9]{3}[A-Z]{2}$/), series("ut-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "VT",
    series: [series("vt-abc123", /^[A-Z]{3}[0-9]{3}$/), series("vt-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "VA",
    series: [series("va-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("va-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "WA",
    series: [series("wa-abc1234", /^[A-Z]{3}[0-9]{4}$/), series("wa-123abc", /^[0-9]{3}[A-Z]{3}$/)],
  },
  {
    code: "WV",
    series: [series("wv-1a2345", /^[0-9][A-Z][0-9]{4}$/), series("wv-abc123", /^[A-Z]{3}[0-9]{3}$/)],
  },
  {
    code: "WI",
    series: [
      series("wi-abc1234", /^[A-Z]{3}[0-9]{4}$/),
      series("wi-123abc", /^[0-9]{3}[A-Z]{3}$/),
      series("wi-abc123", /^[A-Z]{3}[0-9]{3}$/),
    ],
  },
  {
    code: "WY",
    series: [series("wy-1-12345", /^[0-9][0-9]{5}$/), series("wy-12-1234", /^[0-9]{6}$/)],
  },
];

const SERIES_BY_STATE = new Map(STATE_SERIES.map((row) => [row.code, row]));
const STATE_NAME = new Map(US_STATES.map((row) => [row.code, row.name]));

export const PLATE_FORMAT_STATES = STATE_SERIES.map((row) => row.code);

export function normalizePlateChars(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
}

export function normalizePlateState(raw: string): string {
  return raw.trim().toUpperCase().slice(0, 2);
}

function looksPlateShaped(plate: string): boolean {
  if (plate.length < 5 || plate.length > 8) return false;
  const letters = (plate.match(/[A-Z]/g) ?? []).length;
  const digits = (plate.match(/[0-9]/g) ?? []).length;
  return letters >= 1 && digits >= 1;
}

function matchStateSeries(plate: string, state: string): PlateSeries | null {
  const spec = SERIES_BY_STATE.get(state);
  if (!spec) return null;
  return spec.series.find((row) => row.pattern.test(plate)) ?? null;
}

function matchingStates(plate: string): string[] {
  return STATE_SERIES.filter((row) => row.series.some((entry) => entry.pattern.test(plate))).map((row) => row.code);
}

export function plateLooksLikeState(plate: string, state: string): boolean {
  const clean = normalizePlateChars(plate);
  const code = normalizePlateState(state);
  if (!clean || !code) return false;
  return Boolean(matchStateSeries(clean, code));
}

export function inspectPlateFormat(input: { plate?: string; state?: string }): PlateFormatResult {
  const raw = (input.plate ?? "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const plate = raw.slice(0, 8);
  const state = normalizePlateState(input.state ?? "");
  const stateName = STATE_NAME.get(state) ?? "";
  const base = {
    plate,
    state,
    stateName,
    inventedVin: false as const,
    note: PLATE_FORMAT_HONESTY,
  };

  if (!plate) {
    return {
      ...base,
      verdict: "empty",
      matchedId: "",
      recognized: false,
      stamp: "",
    };
  }

  const asVin = normalizeVin(raw);
  if (raw.length === 17 || isValidVin(asVin)) {
    return {
      ...base,
      verdict: "looks-like-vin",
      matchedId: "",
      recognized: false,
      stamp: "That looks like a VIN, not a plate. Paste it on the VIN desk. We did not invent a decode from a plate.",
    };
  }

  if (state) {
    const hit = matchStateSeries(plate, state);
    if (hit) {
      return {
        ...base,
        verdict: "match",
        matchedId: hit.id,
        recognized: true,
        stamp: `Format looks like a ${state} plate`,
      };
    }
    return {
      ...base,
      verdict: "unrecognized",
      matchedId: "",
      recognized: false,
      stamp: PLATE_NOT_VIN_STAMP,
    };
  }

  const hits = matchingStates(plate);
  if (hits.length === 1) {
    const only = hits[0] ?? "";
    const hit = matchStateSeries(plate, only);
    return {
      ...base,
      verdict: "match",
      matchedId: hit?.id ?? "",
      recognized: true,
      stamp: `Format looks like a ${only} plate`,
    };
  }
  if (looksPlateShaped(plate) || hits.length > 1) {
    return {
      ...base,
      verdict: "plate-shaped",
      matchedId: "",
      recognized: false,
      stamp: "Looks plate-shaped — pick a state. Still a note, not a VIN.",
    };
  }

  return {
    ...base,
    verdict: "unrecognized",
    matchedId: "",
    recognized: false,
    stamp: PLATE_NOT_VIN_STAMP,
  };
}
