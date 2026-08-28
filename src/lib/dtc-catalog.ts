import catalog from "@/data/dtc-catalog.json";
import type { JobDtc, JobSeverity } from "@/lib/jobs/types";
import type { DtcEntry, DtcSeverity } from "@/lib/types";

export interface DtcCatalogRow {
  code: string;
  title: string;
  layperson: string;
  likelySystems: string[];
  doNotThrowParts: string;
  firstLook: string;
  sayThis: string;
  severity: JobSeverity;
  typicalCause: string;
  askTheShop: string;
  costBand: string;
  diySafe: boolean;
}

const FILE = catalog as { disclaimer: string; rows: DtcCatalogRow[] };

export const DTC_CATALOG_DISCLAIMER = FILE.disclaimer;
export const DTC_CATALOG_ROWS: DtcCatalogRow[] = FILE.rows.filter((row) => /^[PCBU][0-3][0-9A-F]{3}$/.test(row.code));

export const DTC_CATALOG_BY_CODE: Record<string, DtcCatalogRow> = Object.fromEntries(
  DTC_CATALOG_ROWS.map((row) => [row.code, row]),
);

export const DTC_CATALOG_COUNT = DTC_CATALOG_ROWS.length;

export function toCoreDtc(row: DtcCatalogRow): DtcEntry {
  return {
    code: row.code,
    title: row.title,
    plainEnglish: row.layperson,
    typicalCause: row.typicalCause,
    askTheShop: row.askTheShop,
    costBand: row.costBand,
    severity: row.severity as DtcSeverity,
    diySafe: row.diySafe,
  };
}

export function toJobDtc(row: DtcCatalogRow): JobDtc {
  return {
    code: row.code,
    title: row.title,
    layperson: row.layperson,
    likelySystems: row.likelySystems,
    doNotThrowParts: row.doNotThrowParts,
    firstLook: row.firstLook,
    severity: row.severity,
  };
}

export function mergeCoreBook(book: Record<string, DtcEntry>): Record<string, DtcEntry> {
  const next = { ...book };
  for (const row of DTC_CATALOG_ROWS) {
    if (!next[row.code]) next[row.code] = toCoreDtc(row);
  }
  return next;
}

export function mergeJobBook(book: Record<string, JobDtc>): Record<string, JobDtc> {
  const next = { ...book };
  for (const row of DTC_CATALOG_ROWS) {
    if (!next[row.code]) next[row.code] = toJobDtc(row);
  }
  return next;
}

const SAMPLE_SAY: Record<string, string> = {
  P0420: "I have P0420 stored. I want freeze-frame and a leak check before anyone prices a converter.",
  P0430: "I have P0430 stored. Same graph-and-leak check as P0420 — Bank 2 only. Do not buy two bricks.",
  P0300: "I have P0300 stored. I want misfire counts per cylinder before a coil four-pack.",
  P0171: "I have P0171 stored. I want fuel trims at idle vs 2500 RPM before anyone prices injectors.",
  P0128: "I have P0128 stored. I want a temperature graph to 195–210°F. A flush is not the repair.",
  C0035: "I have C0035 stored. I want that corner's wheel-speed sensor and tone ring — not an ABS module.",
  B0028: "I have B0028 stored. I want an SRS-trained shop. Do not clear and deliver.",
  U0100: "I have U0100 stored. I want voltage at the ECM power pins before a computer.",
};

/** P0420-shaped counter line. Catalog sayThis wins; otherwise the book's ask / hold line. */
export function dtcSayThis(code: string, fallback: string): string {
  const stamp = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const hit = DTC_CATALOG_BY_CODE[stamp];
  if (hit?.sayThis) return hit.sayThis;
  if (SAMPLE_SAY[stamp]) return SAMPLE_SAY[stamp];
  const ask = fallback.replace(/\s+/g, " ").trim();
  if (!stamp || !ask) return "Type the scanner code. Ask for freeze-frame before anyone prices a part.";
  if (/^I have /i.test(ask)) return ask;
  return `I have ${stamp} stored. ${ask}`;
}
