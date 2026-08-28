import { lookupDtc } from "@/lib/dtc";
import { normalizeEntries } from "@/lib/service-log/parse";
import type { ServiceLogEntry } from "@/lib/service-log/types";
import type {
  DtcEntry,
  FlaggedQuoteItem,
  FluidSpecSheet,
  QuoteAnalysisResult,
  SymptomFinding,
  VehicleSpecs,
} from "@/lib/types";

export type ReportMode = "beginner" | "expert";

export const REPORT_PATH = "/report" as const;
export const REPORT_PRINT_PATH = "/report/print" as const;
export const REPORT_API_PATH = "/api/report" as const;
export const REPORT_PRINT_API_PATH = "/api/report/print" as const;
export const REPORT_DOWNLOAD_PATH = "/api/report/download.json" as const;

export const REPORT_DESK_HREFS = ["/quote", "/guides", "/directory", "/obd", "/expert", "/agent", "/log"] as const;

export type ReportDeskHref = (typeof REPORT_DESK_HREFS)[number];

export interface ReportVehicle {
  vin?: string;
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  plate?: string;
  state?: string;
  mileage?: string;
  concern?: string;
}

export interface ReportFluids {
  viscosity?: string;
  capacity?: string;
  tirePsiFront?: string;
  tirePsiRear?: string;
  oilFilterSku?: string;
  airFilterSku?: string;
  cabinFilterSku?: string;
}

export interface ReportQuote {
  flaggedItems: FlaggedQuoteItem[];
  mechanicScript: string[];
  summary: string;
  isQuoteFair: boolean;
}

export interface ReportSymptom {
  title: string;
  askTheShop: string;
}

export interface ReportCode {
  code: string;
  title: string;
  plainEnglish: string;
}

export interface ReportDesk {
  href: ReportDeskHref;
  label: string;
  stamp: string;
}

/** Printable owner-notebook line. Same shape the /log desk stores. */
export type ReportServiceLogRow = ServiceLogEntry;

export interface ReportPacket {
  generatedAt: string;
  mode: ReportMode;
  vehicle: ReportVehicle;
  fluids?: ReportFluids;
  quote?: ReportQuote;
  symptoms?: ReportSymptom[];
  codes?: ReportCode[];
  playbookTicks?: string[];
  /** Owner service-log rows supplied by the client. Never loaded from localStorage here. */
  serviceLog?: ReportServiceLogRow[];
  nextDesks: ReportDesk[];
}

/**
 * Loose bay fields that become a findings packet.
 *
 * `serviceLog` is optional. The /report UI should read localStorage
 * `openhood.service-log` and pass those rows into POST /api/report.
 * This builder — and every /api/report handler — must not read localStorage.
 */
export interface ReportPacketInput {
  packet?: Partial<ReportPacket> | ReportPacket;
  generatedAt?: string;
  mode?: string;
  vehicle?: Partial<ReportVehicle> | Partial<VehicleSpecs> | IdentifiedLike;
  specs?: Partial<VehicleSpecs>;
  fluids?: Partial<ReportFluids> | Partial<FluidSpecSheet>;
  quote?: Partial<QuoteAnalysisResult> | Partial<ReportQuote>;
  symptoms?: Array<Partial<SymptomFinding> | Partial<ReportSymptom> | string>;
  findings?: Array<Partial<SymptomFinding> | Partial<ReportSymptom> | string>;
  codes?: Array<Partial<DtcEntry> | Partial<ReportCode> | string>;
  playbookTicks?: string[];
  serviceLog?: Array<Partial<ServiceLogEntry> | ServiceLogEntry>;
  nextDesks?: Array<string | Partial<ReportDesk>>;
}

interface IdentifiedLike {
  specs?: Partial<VehicleSpecs>;
  fluids?: Partial<FluidSpecSheet>;
}

export const REPORT_NEXT_DESKS: ReportDesk[] = [
  { href: "/quote", stamp: "Quote", label: "Quote defense" },
  { href: "/guides", stamp: "How-to", label: "Guides" },
  { href: "/directory", stamp: "Shops", label: "Directory" },
  { href: "/obd", stamp: "OBD", label: "OBD codes" },
  { href: "/expert", stamp: "Book", label: "Playbooks" },
  { href: "/agent", stamp: "Talk", label: "Advocate" },
  { href: "/log", stamp: "Log", label: "Service log" },
];

const DESK_BY_HREF = new Map<ReportDeskHref, ReportDesk>(
  REPORT_NEXT_DESKS.map((desk) => [desk.href, desk]),
);

export function isReportMode(value: string | null | undefined): value is ReportMode {
  return value === "beginner" || value === "expert";
}

export function normalizeReportMode(value?: string | null): ReportMode {
  const raw = (value ?? "").trim().toLowerCase();
  if (raw === "expert" || raw === "shop-talk" || raw === "genius") return "expert";
  return "beginner";
}

export function isReportDeskHref(value: string): value is ReportDeskHref {
  return (REPORT_DESK_HREFS as readonly string[]).includes(value);
}

/** Build a findings packet from a finished packet or loose bay fields. Empty sections are omitted. */
export function buildReportPacket(input: ReportPacketInput = {}): ReportPacket {
  const seed = isRecord(input.packet) ? input.packet : looksLikePacket(input) ? (input as Partial<ReportPacket>) : {};

  const vehicle = buildVehicle(seed.vehicle, input.vehicle, input.specs);
  const fluids = buildFluids(seed.fluids, input.fluids, identifiedFluids(input.vehicle));
  const quote = buildQuote(seed.quote, input.quote);
  const symptoms = buildSymptoms(seed.symptoms, input.symptoms, input.findings);
  const codes = buildCodes(seed.codes, input.codes);
  const playbookTicks = buildTicks(seed.playbookTicks, input.playbookTicks);
  const serviceLog = buildServiceLog(seed.serviceLog, input.serviceLog);
  const nextDesks = buildDesks(seed.nextDesks, input.nextDesks);

  const packet: ReportPacket = {
    generatedAt: normalizeIso(input.generatedAt) ?? normalizeIso(seed.generatedAt) ?? new Date().toISOString(),
    mode: normalizeReportMode(input.mode ?? seed.mode),
    vehicle,
    nextDesks,
  };

  if (fluids) packet.fluids = fluids;
  if (quote) packet.quote = quote;
  if (symptoms) packet.symptoms = symptoms;
  if (codes) packet.codes = codes;
  if (playbookTicks) packet.playbookTicks = playbookTicks;
  if (serviceLog) packet.serviceLog = serviceLog;

  return packet;
}

export function reportDownloadFilename(packet: ReportPacket): string {
  const vin = packet.vehicle.vin?.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const stamp = vin || packet.generatedAt.slice(0, 10) || "findings";
  return `openhood-findings-${stamp}.json`;
}

export function vehicleHeadline(vehicle: ReportVehicle): string {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(present).join(" ");
}

export function hasVehicleIdentity(vehicle: ReportVehicle): boolean {
  return Boolean(
    present(vehicle.vin) ||
      present(vehicle.year) ||
      present(vehicle.make) ||
      present(vehicle.model) ||
      present(vehicle.plate),
  );
}

function buildVehicle(
  ...sources: Array<Partial<ReportVehicle> | Partial<VehicleSpecs> | IdentifiedLike | undefined>
): ReportVehicle {
  const vehicle: ReportVehicle = {};
  for (const source of sources) {
    if (!source) continue;
    const specs = isIdentifiedLike(source) ? source.specs : source;
    if (!specs) continue;
    const next: ReportVehicle = {
      vin: clean(readString(specs, "vin")),
      year: clean(readString(specs, "year")),
      make: clean(readString(specs, "make")),
      model: clean(readString(specs, "model")),
      trim: clean(readString(specs, "trim")),
      engine: clean(readString(specs, "engine")) ?? composeEngine(specs as Partial<VehicleSpecs>),
      plate: clean(readString(specs, "plate")),
      state: clean(readString(specs, "state")) ?? clean(readString(specs, "plateState")),
      mileage: clean(readString(specs, "mileage")),
      concern: clean(readString(specs, "concern")),
    };
    Object.assign(vehicle, omitEmpty(next));
  }
  return vehicle;
}

function composeEngine(specs: Partial<VehicleSpecs>): string | undefined {
  const displacement = clean(specs.engineDisplacement);
  const model = clean(specs.engineModel);
  const config = clean(specs.engineConfig);
  const cylinders = clean(specs.cylinders);
  const bits = [displacement, model ?? config, cylinders ? `${cylinders}-cyl` : undefined].filter(present);
  return bits.length ? bits.join(" ") : undefined;
}

function buildFluids(
  ...sources: Array<Partial<ReportFluids> | Partial<FluidSpecSheet> | undefined>
): ReportFluids | undefined {
  const fluids: ReportFluids = {};
  for (const source of sources) {
    if (!source) continue;
    const next: ReportFluids = {
      viscosity: clean(readString(source, "viscosity")) ?? clean(readString(source, "oilViscosity")),
      capacity: clean(readString(source, "capacity")) ?? clean(readString(source, "oilCapacityQt")),
      tirePsiFront: clean(readString(source, "tirePsiFront")),
      tirePsiRear: clean(readString(source, "tirePsiRear")),
      oilFilterSku: clean(readString(source, "oilFilterSku")),
      airFilterSku: clean(readString(source, "airFilterSku")),
      cabinFilterSku: clean(readString(source, "cabinFilterSku")),
    };
    Object.assign(fluids, omitEmpty(next));
  }
  return Object.keys(fluids).length ? fluids : undefined;
}

function buildQuote(
  ...sources: Array<Partial<QuoteAnalysisResult> | Partial<ReportQuote> | undefined>
): ReportQuote | undefined {
  let flaggedItems: FlaggedQuoteItem[] = [];
  let mechanicScript: string[] = [];
  let summary = "";
  let isQuoteFair: boolean | undefined;
  let saw = false;

  for (const source of sources) {
    if (!source) continue;
    saw = true;
    if (Array.isArray(source.flaggedItems)) {
      flaggedItems = source.flaggedItems.map(mapFlaggedItem).filter((row): row is FlaggedQuoteItem => Boolean(row));
    }
    if (Array.isArray(source.mechanicScript)) {
      mechanicScript = uniquePresent(source.mechanicScript);
    }
    if (present(source.summary)) summary = source.summary.trim();
    if (typeof source.isQuoteFair === "boolean") isQuoteFair = source.isQuoteFair;
  }

  if (!saw) return undefined;
  if (!flaggedItems.length && !mechanicScript.length && !summary) return undefined;

  return {
    flaggedItems,
    mechanicScript,
    summary,
    isQuoteFair: Boolean(isQuoteFair),
  };
}

function buildSymptoms(
  ...sources: Array<Array<Partial<SymptomFinding> | Partial<ReportSymptom> | string> | undefined>
): ReportSymptom[] | undefined {
  const rows: ReportSymptom[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const row of source) {
      const mapped = mapSymptom(row);
      if (!mapped) continue;
      const key = `${mapped.title}\n${mapped.askTheShop}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(mapped);
    }
  }

  return rows.length ? rows : undefined;
}

function mapSymptom(row: Partial<SymptomFinding> | Partial<ReportSymptom> | string): ReportSymptom | undefined {
  if (typeof row === "string") {
    const title = clean(row);
    return title ? { title, askTheShop: "" } : undefined;
  }
  const title = clean(row.title);
  const askTheShop = clean(row.askTheShop) ?? "";
  if (!title && !askTheShop) return undefined;
  return { title: title ?? askTheShop, askTheShop: title ? askTheShop : "" };
}

function buildCodes(
  ...sources: Array<Array<Partial<DtcEntry> | Partial<ReportCode> | string> | undefined>
): ReportCode[] | undefined {
  const rows: ReportCode[] = [];
  const seen = new Set<string>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const row of source) {
      const mapped = mapCode(row);
      if (!mapped || seen.has(mapped.code)) continue;
      seen.add(mapped.code);
      rows.push(mapped);
    }
  }

  return rows.length ? rows : undefined;
}

function mapCode(row: Partial<DtcEntry> | Partial<ReportCode> | string): ReportCode | undefined {
  if (typeof row === "string") {
    return hydrateCode(row, {}, true);
  }
  const raw = clean(row.code);
  if (!raw) return undefined;
  return hydrateCode(raw, {
    title: clean(row.title),
    plainEnglish: clean(row.plainEnglish),
  }, false);
}

function hydrateCode(
  raw: string,
  given: { title?: string; plainEnglish?: string },
  requireValid: boolean,
): ReportCode | undefined {
  const lookup = lookupDtc(raw);
  if (requireValid && !lookup.valid && !given.title && !given.plainEnglish) return undefined;
  const code = lookup.code || raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (!code) return undefined;
  const title = given.title ?? lookup.entry?.title ?? (lookup.generic ? `${lookup.generic.system} code` : undefined);
  const plainEnglish = given.plainEnglish ?? lookup.entry?.plainEnglish ?? lookup.generic?.hint;
  if (!title && !plainEnglish) return { code, title: code, plainEnglish: "" };
  return { code, title: title ?? code, plainEnglish: plainEnglish ?? "" };
}

function buildTicks(...sources: Array<string[] | undefined>): string[] | undefined {
  const ticks = uniquePresent(sources.flatMap((source) => (Array.isArray(source) ? source : [])));
  return ticks.length ? ticks : undefined;
}

function buildServiceLog(
  ...sources: Array<Array<Partial<ServiceLogEntry> | ServiceLogEntry> | undefined>
): ReportServiceLogRow[] | undefined {
  const rows = normalizeEntries(sources.flatMap((source) => (Array.isArray(source) ? source : [])));
  return rows.length ? rows : undefined;
}

function buildDesks(
  ...sources: Array<Array<string | Partial<ReportDesk>> | ReportDesk[] | undefined>
): ReportDesk[] {
  const hrefs: ReportDeskHref[] = [];
  const seen = new Set<ReportDeskHref>();

  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const row of source) {
      const href = typeof row === "string" ? row.trim() : clean(row.href);
      if (!href || !isReportDeskHref(href) || seen.has(href)) continue;
      seen.add(href);
      hrefs.push(href);
    }
  }

  const picked = hrefs.map((href) => DESK_BY_HREF.get(href)).filter((desk): desk is ReportDesk => Boolean(desk));
  return picked.length ? picked : REPORT_NEXT_DESKS.map((desk) => ({ ...desk }));
}

function identifiedFluids(vehicle: ReportPacketInput["vehicle"]): Partial<FluidSpecSheet> | undefined {
  return isIdentifiedLike(vehicle) ? vehicle.fluids : undefined;
}

function mapFlaggedItem(row: unknown): FlaggedQuoteItem | undefined {
  if (!isRecord(row) || !present(row.item)) return undefined;
  const category = row.category;
  return {
    item: String(row.item).trim(),
    quotedPrice: typeof row.quotedPrice === "number" && Number.isFinite(row.quotedPrice) ? row.quotedPrice : null,
    fairPriceRange: typeof row.fairPriceRange === "string" ? row.fairPriceRange : "",
    warning: typeof row.warning === "string" ? row.warning : "",
    category:
      category === "markup" || category === "upsell" || category === "labor" || category === "ok" ? category : "ok",
  };
}

function looksLikePacket(input: ReportPacketInput): boolean {
  return Boolean(input.vehicle && (input.mode || input.generatedAt) && !input.packet && !input.specs);
}

function isIdentifiedLike(value: unknown): value is IdentifiedLike {
  return isRecord(value) && isRecord(value.specs);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(source: object, key: string): string | undefined {
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : undefined;
}

function clean(value: string | undefined): string | undefined {
  return present(value) ? value.trim() : undefined;
}

function present(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const next = value.trim();
  if (!next) return false;
  return !/^(—|--|n\/?a|null|undefined)$/i.test(next);
}

function omitEmpty<T extends object>(row: T): Partial<T> {
  const next: Partial<T> = {};
  for (const [key, value] of Object.entries(row)) {
    if (present(value)) next[key as keyof T] = value as T[keyof T];
  }
  return next;
}

function uniquePresent(values: unknown[]): string[] {
  const seen = new Set<string>();
  const rows: string[] = [];
  for (const value of values) {
    if (typeof value !== "string") continue;
    const next = value.trim();
    if (!present(next) || seen.has(next)) continue;
    seen.add(next);
    rows.push(next);
  }
  return rows;
}

function normalizeIso(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}
