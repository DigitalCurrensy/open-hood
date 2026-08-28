import raw from "@/data/labor-zip-bands.json";
import {
  EstimateError,
  LABOR_DISCLAIMER,
  type LaborBand,
  type LaborBandId,
  type LaborZipBandsFile,
  type ZipMapping,
} from "@/lib/labor/types";

const FILE = raw as LaborZipBandsFile;

const BAND_IDS = new Set<LaborBandId>(["rural", "midwest", "sunbelt", "mountain", "coast"]);

export const ZIP_DISCLAIMER = FILE.disclaimer || LABOR_DISCLAIMER;
export const NATIONAL_INDIE = FILE.nationalIndie;

export function allBands(): LaborBand[] {
  return Object.values(FILE.bands);
}

export function bandById(id: LaborBandId): LaborBand {
  return FILE.bands[id];
}

export function normalizeZip(rawZip: string): string {
  const digits = rawZip.replace(/\D/g, "");
  if (digits.length < 5) {
    throw new EstimateError("Need a 5-digit US ZIP.");
  }
  return digits.slice(0, 5);
}

function asBandId(value: string | undefined): LaborBandId | undefined {
  if (value && BAND_IDS.has(value as LaborBandId)) return value as LaborBandId;
  return undefined;
}

export function mapZip(rawZip: string): ZipMapping {
  const zip = normalizeZip(rawZip);
  const zip3 = zip.slice(0, 3);
  const zip2 = zip.slice(0, 2);
  const zip1 = zip.slice(0, 1);

  const three = asBandId(FILE.prefixes[zip3]);
  if (three) {
    return {
      input: rawZip.trim(),
      zip,
      prefix: zip3,
      match: "zip3",
      bandId: three,
      steps: [
        `Strip to 5 digits → ${zip}.`,
        `First three digits ${zip3} sit in the prefix table → ${three}.`,
        "Dealer dollars are the indie band times that region’s dealer multiplier.",
      ],
    };
  }

  const two = asBandId(FILE.prefixes[zip2]);
  if (two) {
    return {
      input: rawZip.trim(),
      zip,
      prefix: zip2,
      match: "zip2",
      bandId: two,
      steps: [
        `Strip to 5 digits → ${zip}.`,
        `No 3-digit row for ${zip3}. First two digits ${zip2} → ${two}.`,
        "Dealer dollars are the indie band times that region’s dealer multiplier.",
      ],
    };
  }

  const digit = asBandId(FILE.digitDefaults[zip1]);
  if (!digit) {
    throw new EstimateError("That ZIP is not on the US prefix table.");
  }

  return {
    input: rawZip.trim(),
    zip,
    prefix: zip1,
    match: "digit",
    bandId: digit,
    steps: [
      `Strip to 5 digits → ${zip}.`,
      `No 3-digit or 2-digit row. First digit ${zip1} region → ${digit}.`,
      "Dealer dollars are the indie band times that region’s dealer multiplier.",
    ],
  };
}

export function zipBand(rawZip: string): { mapping: ZipMapping; band: LaborBand } {
  const mapping = mapZip(rawZip);
  return { mapping, band: bandById(mapping.bandId) };
}
