const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;

/** ISO 3779 / NHTSA transliteration. I, O, Q are not used. */
const VIN_TRANSLIT: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
};

/** Position weights. Index 8 (check digit) is 0. */
const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2] as const;

export const VIN_CHECK_DIGIT_INDEX = 8;

export const VIN_CHECK_DIGIT_PASS_STAMP =
  "ISO 3779 check digit passes — the 17 is internally consistent. WMI still comes from NHTSA, not this math.";

export const VIN_CHECK_DIGIT_FAIL_STAMP =
  "This VIN fails the check digit — NHTSA may still decode WMI, do not trust the whole string.";

export function normalizeVin(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 17);
}

/** Charset + length only. Check digit is a separate stamp — do not gate identify on it. */
export function isValidVin(vin: string): boolean {
  return VIN_PATTERN.test(vin);
}

function vinCharValue(char: string): number | null {
  if (/[0-9]/.test(char)) return Number(char);
  const mapped = VIN_TRANSLIT[char];
  return mapped === undefined ? null : mapped;
}

export function expectedVinCheckDigit(vin: string): string {
  const clean = normalizeVin(vin);
  if (clean.length !== 17) return "";
  let sum = 0;
  for (let index = 0; index < 17; index += 1) {
    const value = vinCharValue(clean[index] ?? "");
    if (value === null) return "";
    sum += value * VIN_WEIGHTS[index];
  }
  const remainder = sum % 11;
  return remainder === 10 ? "X" : String(remainder);
}

export interface VinCheckDigitReport {
  vin: string;
  ready: boolean;
  ok: boolean;
  actual: string;
  expected: string;
  stamp: string;
}

export function inspectVinCheckDigit(raw: string): VinCheckDigitReport {
  const vin = normalizeVin(raw);
  if (vin.length !== 17) {
    return { vin, ready: false, ok: false, actual: "", expected: "", stamp: "" };
  }
  if (!VIN_PATTERN.test(vin)) {
    return {
      vin,
      ready: true,
      ok: false,
      actual: vin[VIN_CHECK_DIGIT_INDEX] ?? "",
      expected: "",
      stamp: "I, O, and Q are never used in a VIN. This 17 is not legal charset.",
    };
  }
  const expected = expectedVinCheckDigit(vin);
  const actual = vin[VIN_CHECK_DIGIT_INDEX] ?? "";
  const ok = Boolean(expected) && actual === expected;
  return {
    vin,
    ready: true,
    ok,
    actual,
    expected,
    stamp: ok ? VIN_CHECK_DIGIT_PASS_STAMP : VIN_CHECK_DIGIT_FAIL_STAMP,
  };
}

export function vinCheckDigitOk(vin: string): boolean {
  return inspectVinCheckDigit(vin).ok;
}

/** First character → ISO 3780 geography. Not a manufacturer catalog. */
const WMI_TERRITORY: Record<string, { region: string; territory: string }> = {
  "1": { region: "North America", territory: "United States" },
  "2": { region: "North America", territory: "Canada" },
  "3": { region: "North America", territory: "Mexico" },
  "4": { region: "North America", territory: "United States" },
  "5": { region: "North America", territory: "United States" },
  "6": { region: "Oceania", territory: "Oceania" },
  "7": { region: "Oceania", territory: "Oceania" },
  "8": { region: "South America", territory: "South America" },
  "9": { region: "South America", territory: "South America" },
  A: { region: "Africa", territory: "Africa" },
  B: { region: "Africa", territory: "Africa" },
  C: { region: "Africa", territory: "Africa" },
  D: { region: "Africa", territory: "Africa" },
  E: { region: "Africa", territory: "Africa" },
  F: { region: "Africa", territory: "Africa" },
  G: { region: "Africa", territory: "Africa" },
  H: { region: "Africa", territory: "Africa" },
  J: { region: "Asia", territory: "Japan" },
  K: { region: "Asia", territory: "Korea" },
  L: { region: "Asia", territory: "China" },
  M: { region: "Asia", territory: "Asia" },
  N: { region: "Asia", territory: "Asia" },
  P: { region: "Asia", territory: "Asia" },
  R: { region: "Asia", territory: "Asia" },
  S: { region: "Europe", territory: "United Kingdom" },
  T: { region: "Europe", territory: "Europe" },
  U: { region: "Europe", territory: "Europe" },
  V: { region: "Europe", territory: "Europe" },
  W: { region: "Europe", territory: "Germany" },
  X: { region: "Europe", territory: "Europe" },
  Y: { region: "Europe", territory: "Europe" },
  Z: { region: "Europe", territory: "Italy" },
};

export function vinWmi(vin: string): string {
  return normalizeVin(vin).slice(0, 3);
}

export function vinVds(vin: string): string {
  return normalizeVin(vin).slice(3, 9);
}

export function vinVis(vin: string): string {
  return normalizeVin(vin).slice(9);
}

export function wmiRegion(wmiOrVin: string): { region: string; territory: string } {
  const first = normalizeVin(wmiOrVin)[0] ?? "";
  return WMI_TERRITORY[first] ?? { region: "Unknown", territory: "Unknown" };
}

export interface VinStructure {
  vin: string;
  wmi: string;
  vds: string;
  vis: string;
  checkDigit: string;
  yearCode: string;
  plantCode: string;
  region: string;
  territory: string;
  stamp: string;
}

export function describeVinStructure(raw: string): VinStructure {
  const vin = normalizeVin(raw);
  const wmi = vin.slice(0, 3);
  const geo = wmiRegion(wmi);
  const ready = vin.length === 17;
  const where = geo.territory !== geo.region ? `${geo.region} (${geo.territory}-coded)` : geo.region;
  return {
    vin,
    wmi,
    vds: vin.slice(3, 9),
    vis: vin.slice(9),
    checkDigit: vin[VIN_CHECK_DIGIT_INDEX] ?? "",
    yearCode: vin[9] ?? "",
    plantCode: vin[10] ?? "",
    region: geo.region,
    territory: geo.territory,
    stamp: ready
      ? `WMI ${wmi} · ${where}. Geography from the first character — not a manufacturer catalog.`
      : "",
  };
}

export const DEMO_VINS: Array<{ vin: string; label: string }> = [
  { vin: "1HGCM82633A004352", label: "2003 Honda Accord" },
  { vin: "1FTFW1ET5DFC10312", label: "2013 Ford F-150" },
  { vin: "5YJSA1E26HF000123", label: "2017 Tesla Model S" },
];
