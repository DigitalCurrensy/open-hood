/**
 * J.D. Power Chrome Data is not connected.
 * /sticker prints vPIC decoder fields. This module exists so we never pretend
 * that sheet is a Monroney, a style ID, or a package list.
 * A live catalog belongs on ROADMAP.md after a signed contract — do not fake one.
 */

export const CHROME_API_ENV = "CHROME_API_KEY";
export const CHROME_DATA_ENV = "CHROME_DATA_KEY";
export const CHROME_DATA_VENDOR = "J.D. Power Chrome Data";
export const CHROME_DATA_HOME = "https://www.jdpower.com/business/automotive/chrome-data";
export const CHROME_LIVE_WHEN = "CHROME_API_KEY / JD Power contract";

export const CHROME_DATA_REASON =
  "No live J.D. Power / Chrome Data catalog is connected. MSRP, packages, destination, and RPO codes are not in the VIN. Style IDs stay dark until a contract lands.";

export const CHROME_OUTREACH_BLURB =
  "Live when CHROME_API_KEY / JD Power contract. Until then this ledger is vPIC completeness — not MSRP, not a Monroney. Email J.D. Power Chrome Data; do not scrape a window sticker.";

export const chromeData = {
  connected: false as const,
  vendor: CHROME_DATA_VENDOR,
  env: CHROME_API_ENV,
  envAlias: CHROME_DATA_ENV,
  liveWhen: CHROME_LIVE_WHEN,
  homeUrl: CHROME_DATA_HOME,
  reason: CHROME_DATA_REASON,
  outreach: CHROME_OUTREACH_BLURB,
};

export type ChromeDataStatus = typeof chromeData;

export function chromeKeyPresent(): boolean {
  return Boolean(process.env.CHROME_API_KEY?.trim() || process.env.CHROME_DATA_KEY?.trim());
}

export function chromeDataStatus(): ChromeDataStatus {
  return chromeData;
}

export type ChromeFieldLane = "vpic" | "chrome";

export interface ChromeFieldRow {
  id: string;
  label: string;
  lane: ChromeFieldLane;
  note: string;
}

/** What NHTSA vPIC / DecodeVinValues can print from the 17. */
export const VPIC_LEDGER_FIELDS: readonly ChromeFieldRow[] = [
  { id: "vin", label: "VIN", lane: "vpic", note: "The 17. WMI + VDS + VIS." },
  { id: "year", label: "Year / make / model", lane: "vpic", note: "Nameplate from the decoder." },
  { id: "trim", label: "Trim / series", lane: "vpic", note: "Decoder fields — not a package list." },
  { id: "body", label: "Body / doors / drive", lane: "vpic", note: "BodyClass, doors, drive type." },
  { id: "displacement", label: "Displacement", lane: "vpic", note: "Printed as 3.0L, not 3.00." },
  { id: "engine", label: "Engine code / layout / HP", lane: "vpic", note: "When vPIC filled the row." },
  { id: "fuel", label: "Fuel / hybrid / EV", lane: "vpic", note: "Primary fuel and electrification." },
  { id: "plant", label: "Plant / manufacturer", lane: "vpic", note: "City, state, country." },
  { id: "restraints", label: "Airbags / belts / TPMS", lane: "vpic", note: "Safety equipment flags." },
];

/** What only a licensed Chrome / J.D. Power catalog would have. Never invent these. */
export const CHROME_ONLY_FIELDS: readonly ChromeFieldRow[] = [
  { id: "msrp", label: "MSRP", lane: "chrome", note: "Window price. Not in the VIN." },
  { id: "packages", label: "Packages / options", lane: "chrome", note: "Build sheet. vPIC does not list them." },
  { id: "styleId", label: "styleId", lane: "chrome", note: "Chrome style identifier." },
  { id: "destination", label: "Destination charge", lane: "chrome", note: "Monroney freight line." },
  { id: "rpo", label: "RPO / option codes", lane: "chrome", note: "Factory option alphabet. Dark here." },
];

export type ChromeStyleRow = {
  styleId: string;
  msrp: number;
  packages: string[];
  destination: number;
  rpo: string[];
};

/** Dark catalog. Plug the JD Power HTTP call into `fetchChromeCatalog` the hour the contract + key land. */
export type ChromeCatalogResult = {
  connected: false;
  liveWhen: typeof CHROME_LIVE_WHEN;
  keyPresent: boolean;
  contract: false;
  vin: string;
  styleId: null;
  msrp: null;
  packages: [];
  destination: null;
  rpo: [];
  styles: ChromeStyleRow[];
  reason: string;
  outreach: string;
};

export function darkChromeCatalog(vin = ""): ChromeCatalogResult {
  return {
    connected: false,
    liveWhen: CHROME_LIVE_WHEN,
    keyPresent: chromeKeyPresent(),
    contract: false,
    vin: vin.trim().toUpperCase(),
    styleId: null,
    msrp: null,
    packages: [],
    destination: null,
    rpo: [],
    styles: [],
    reason: CHROME_DATA_REASON,
    outreach: CHROME_OUTREACH_BLURB,
  };
}

/**
 * Adapter shape for a licensed Chrome / J.D. Power catalog.
 * A key in env does not flip `connected`. Never invent MSRP.
 */
export async function fetchChromeCatalog(input: { vin?: string } = {}): Promise<ChromeCatalogResult> {
  return darkChromeCatalog(input.vin ?? "");
}

export function chromeFieldLedger(): {
  connected: false;
  liveWhen: typeof CHROME_LIVE_WHEN;
  vpic: readonly ChromeFieldRow[];
  chromeOnly: readonly ChromeFieldRow[];
  reason: string;
  outreach: string;
} {
  return {
    connected: false,
    liveWhen: CHROME_LIVE_WHEN,
    vpic: VPIC_LEDGER_FIELDS,
    chromeOnly: CHROME_ONLY_FIELDS,
    reason: CHROME_DATA_REASON,
    outreach: CHROME_OUTREACH_BLURB,
  };
}
