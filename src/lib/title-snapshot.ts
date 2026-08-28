import { isValidVin, normalizeVin } from "@/lib/vin";

export const TITLE_SNAPSHOT_STAMP = "Not a Carfax file. Not Consumer Reports.";
export const TITLE_EMPTY_NOTICE =
  "Empty bay. No VinAudit or CarsXE history key. Not a Carfax file. We will not invent accidents, salvage, or an owner count.";

export type TitleVendor = "vinaudit" | "carsxe";

export interface TitleBrandFlag {
  id: string;
  label: string;
  reported: boolean;
}

export interface TitleSnapshotRecord {
  date: string;
  kind: string;
  detail: string;
}

export interface TitleSnapshotStatus {
  vinaudit: boolean;
  carsxe: boolean;
  live: boolean;
  preferred: TitleVendor | null;
  configured: boolean;
  stamp: string;
  notice: string;
}

export interface TitleSnapshot {
  ok: boolean;
  configured: boolean;
  connected: boolean;
  vendor: TitleVendor | null;
  vendorLabel: string;
  vin: string;
  stamp: string;
  notice: string;
  year: string;
  make: string;
  model: string;
  brands: TitleBrandFlag[];
  records: TitleSnapshotRecord[];
  invented: false;
  error?: string;
}

function envOn(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function carsxeHistoryKey(): string {
  return process.env.CARSXE_HISTORY_API_KEY?.trim() || process.env.CARSXE_API_KEY?.trim() || "";
}

export function titleSnapshotStatus(): TitleSnapshotStatus {
  const vinaudit = envOn("VINAUDIT_API_KEY");
  const carsxe = Boolean(carsxeHistoryKey());
  const preferred: TitleVendor | null = vinaudit ? "vinaudit" : carsxe ? "carsxe" : null;
  return {
    vinaudit,
    carsxe,
    live: Boolean(preferred),
    preferred,
    configured: Boolean(preferred),
    stamp: TITLE_SNAPSHOT_STAMP,
    notice: preferred
      ? preferred === "vinaudit"
        ? "Source: VinAudit. Named vendor. Not a Carfax file. We still do not invent wrecks."
        : "Source: CarsXE history. Named vendor. Not a Carfax file. We still do not invent wrecks."
      : TITLE_EMPTY_NOTICE,
  };
}

function emptySnapshot(vin: string, extras: Partial<TitleSnapshot> = {}): TitleSnapshot {
  const status = titleSnapshotStatus();
  return {
    ok: true,
    configured: status.configured,
    connected: false,
    vendor: status.preferred,
    vendorLabel: "",
    vin,
    stamp: TITLE_SNAPSHOT_STAMP,
    notice: status.notice,
    year: "",
    make: "",
    model: "",
    brands: [],
    records: [],
    invented: false,
    ...extras,
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(source: Record<string, unknown> | null, ...keys: string[]): string {
  if (!source) return "";
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function asBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const needle = value.trim().toLowerCase();
    if (["true", "yes", "y", "1"].includes(needle)) return true;
    if (["false", "no", "n", "0"].includes(needle)) return false;
  }
  return null;
}

const BRAND_LABELS: Array<{ id: string; label: string; keys: string[] }> = [
  { id: "salvage", label: "Salvage", keys: ["salvage", "is_salvage", "salvagebrand"] },
  { id: "junk", label: "Junk", keys: ["junk", "is_junk", "junkbrand"] },
  { id: "rebuilt", label: "Rebuilt", keys: ["rebuilt", "is_rebuilt", "rebuiltbrand"] },
  { id: "flood", label: "Flood", keys: ["flood", "is_flood", "floodbrand"] },
  { id: "lemon", label: "Lemon", keys: ["lemon", "is_lemon", "lemonbrand"] },
  { id: "theft", label: "Theft", keys: ["theft", "stolen", "is_theft"] },
];

function brandsFrom(source: Record<string, unknown> | null): TitleBrandFlag[] {
  if (!source) return [];
  const flags: TitleBrandFlag[] = [];
  for (const row of BRAND_LABELS) {
    for (const key of row.keys) {
      const hit = asBool(source[key]);
      if (hit === null) continue;
      flags.push({ id: row.id, label: row.label, reported: hit });
      break;
    }
  }
  return flags;
}

function recordsFrom(value: unknown): TitleSnapshotRecord[] {
  if (!Array.isArray(value)) return [];
  const out: TitleSnapshotRecord[] = [];
  for (const row of value) {
    const rec = asRecord(row);
    if (!rec) continue;
    const date = readString(rec, "date", "Date", "eventDate", "record_date");
    const kind = readString(rec, "type", "kind", "event", "title", "recordType");
    const detail = readString(rec, "detail", "description", "note", "comments", "source");
    if (!date && !kind && !detail) continue;
    out.push({ date, kind, detail });
    if (out.length >= 12) break;
  }
  return out;
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("Title vendor returned a non-JSON body. We will not invent a jacket.");
  }
  if (!response.ok) {
    const rec = asRecord(body);
    throw new Error(readString(rec, "error", "message", "Error") || `Title vendor HTTP ${response.status}.`);
  }
  return body;
}

async function fetchVinAudit(vin: string): Promise<TitleSnapshot> {
  const key = process.env.VINAUDIT_API_KEY?.trim() ?? "";
  const url = new URL("https://api.vinaudit.com/query.php");
  url.searchParams.set("key", key);
  url.searchParams.set("vin", vin);
  url.searchParams.set("format", "json");
  const body = await fetchJson(url.toString());
  const root = asRecord(body);
  const attrs = asRecord(root?.attributes) ?? asRecord(root?.vehicle) ?? root;
  const brands = brandsFrom(asRecord(root?.brands) ?? attrs);
  return {
    ok: true,
    configured: true,
    connected: true,
    vendor: "vinaudit",
    vendorLabel: "VinAudit",
    vin,
    stamp: TITLE_SNAPSHOT_STAMP,
    notice: "Source: VinAudit. Named vendor. Not a Carfax file. We did not invent these brands.",
    year: readString(attrs, "year", "modelYear", "Year"),
    make: readString(attrs, "make", "Make"),
    model: readString(attrs, "model", "Model"),
    brands,
    records: recordsFrom(root?.records ?? root?.history ?? root?.events),
    invented: false,
  };
}

async function fetchCarsXeHistory(vin: string): Promise<TitleSnapshot> {
  const key = carsxeHistoryKey();
  const url = new URL("https://api.carsxe.com/history");
  url.searchParams.set("key", key);
  url.searchParams.set("vin", vin);
  url.searchParams.set("format", "json");
  const body = await fetchJson(url.toString());
  const root = asRecord(body);
  const vehicle = asRecord(root?.vehicle) ?? asRecord(root?.specs) ?? root;
  return {
    ok: true,
    configured: true,
    connected: true,
    vendor: "carsxe",
    vendorLabel: "CarsXE",
    vin,
    stamp: TITLE_SNAPSHOT_STAMP,
    notice: "Source: CarsXE history. Named vendor. Not a Carfax file. We did not invent these brands.",
    year: readString(vehicle, "year", "modelYear", "Year"),
    make: readString(vehicle, "make", "Make"),
    model: readString(vehicle, "model", "Model"),
    brands: brandsFrom(asRecord(root?.brands) ?? vehicle),
    records: recordsFrom(root?.records ?? root?.history ?? root?.events),
    invented: false,
  };
}

export async function fetchTitleSnapshot(rawVin: string): Promise<TitleSnapshot> {
  const vin = normalizeVin(rawVin);
  if (!isValidVin(vin)) {
    return emptySnapshot("", { ok: false, error: "Enter a 17-character VIN. We will not invent a title file." });
  }

  const status = titleSnapshotStatus();
  if (!status.preferred) return emptySnapshot(vin);

  try {
    return status.preferred === "vinaudit" ? await fetchVinAudit(vin) : await fetchCarsXeHistory(vin);
  } catch (error) {
    return emptySnapshot(vin, {
      ok: false,
      vendor: status.preferred,
      vendorLabel: status.preferred === "vinaudit" ? "VinAudit" : "CarsXE",
      error: error instanceof Error ? error.message : "Title vendor did not return a snapshot.",
    });
  }
}
