import { getJob, type CatalogJob } from "@/lib/labor";

export const DARK_HOURS_STAMP = "typical independent · not Motor" as const;

export type HoursSource = "Motor" | "Mitchell" | "ALLDATA" | "typical";

export interface HoursVendorKeys {
  motor: boolean;
  mitchell: boolean;
  alldata: boolean;
}

export interface LicensedHoursRow {
  catalogId: string;
  slug: string;
  hoursLow: number;
  hoursHigh: number;
  source: Exclude<HoursSource, "typical">;
}

export interface HoursBook {
  source: HoursSource;
  stamp: string;
  licensed: boolean;
  catalogIds: string[];
  bySlug: Record<string, LicensedHoursRow>;
}

export interface HoursStatus {
  motorKey: boolean;
  mitchellKey: boolean;
  alldataKey: boolean;
  extractReady: boolean;
  licensed: boolean;
  source: HoursSource;
  stamp: string;
  message: string;
}

function envOn(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function envUrl(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** Presence only. Never returns or logs the secret. */
export function licensedHoursKeys(): HoursVendorKeys {
  return {
    motor: envOn("MOTOR_API_KEY"),
    mitchell: envOn("MITCHELL_API_KEY"),
    alldata: envOn("ALLDATA_API_KEY"),
  };
}

export function hoursStamp(source: HoursSource, catalogId?: string): string {
  if (source === "typical") return DARK_HOURS_STAMP;
  return catalogId ? `${source} · ${catalogId}` : source;
}

export function typicalHoursBook(): HoursBook {
  return {
    source: "typical",
    stamp: DARK_HOURS_STAMP,
    licensed: false,
    catalogIds: [],
    bySlug: {},
  };
}

export function hoursStatus(): HoursStatus {
  const keys = licensedHoursKeys();
  const extractReady =
    (keys.motor && Boolean(envUrl("MOTOR_HOURS_URL"))) ||
    (keys.mitchell && Boolean(envUrl("MITCHELL_HOURS_URL"))) ||
    (keys.alldata && Boolean(envUrl("ALLDATA_HOURS_URL")));
  return {
    motorKey: keys.motor,
    mitchellKey: keys.mitchell,
    alldataKey: keys.alldata,
    extractReady,
    licensed: false,
    source: "typical",
    stamp: DARK_HOURS_STAMP,
    message: extractReady
      ? "Key + extract URL on. POST /api/quote fetches and stamps Motor|Mitchell|ALLDATA only if the vendor answers with hours. A miss stays the typical-hour book — never relabeled."
      : DARK_HOURS_STAMP,
  };
}

function asFiniteHours(value: unknown): number | null {
  const hours = typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : Number.NaN;
  return Number.isFinite(hours) && hours > 0 && hours < 40 ? hours : null;
}

function readVendorRow(
  raw: unknown,
  fallback: CatalogJob,
  source: Exclude<HoursSource, "typical">,
): LicensedHoursRow | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const low = asFiniteHours(row.hoursLow ?? row.hours);
  const high = asFiniteHours(row.hoursHigh ?? row.hours) ?? low;
  if (low == null || high == null) return null;
  const catalogId = String(row.catalogId ?? row.id ?? fallback.id).trim() || fallback.id;
  const slug = String(row.slug ?? fallback.slug).trim() || fallback.slug;
  return {
    catalogId,
    slug,
    hoursLow: Math.min(low, high),
    hoursHigh: Math.max(low, high),
    source,
  };
}

async function fetchVendorHours(
  source: Exclude<HoursSource, "typical">,
  url: string,
  key: string,
  jobs: CatalogJob[],
  ymm: { year?: string; make?: string; model?: string },
): Promise<LicensedHoursRow[]> {
  if (!url || !key || !jobs.length) return [];
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobs: jobs.map((job) => ({ catalogId: job.id, slug: job.slug })),
        year: ymm.year ?? "",
        make: ymm.make ?? "",
        model: ymm.model ?? "",
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return [];
    const body = (await response.json()) as Record<string, unknown>;
    const list = Array.isArray(body.hours)
      ? body.hours
      : Array.isArray(body.jobs)
        ? body.jobs
        : [body];
    const out: LicensedHoursRow[] = [];
    for (const raw of list) {
      const hint =
        raw && typeof raw === "object"
          ? String((raw as Record<string, unknown>).slug ?? (raw as Record<string, unknown>).catalogId ?? "")
          : "";
      const job = (hint && getJob(hint)) || jobs[0];
      if (!job) continue;
      const parsed = readVendorRow(raw, job, source);
      if (parsed) out.push(parsed);
    }
    return out;
  } catch {
    return [];
  }
}

function bookFromRows(rows: LicensedHoursRow[]): HoursBook {
  if (!rows.length) return typicalHoursBook();
  const bySlug: Record<string, LicensedHoursRow> = {};
  const catalogIds: string[] = [];
  for (const row of rows) {
    bySlug[row.slug] = row;
    bySlug[row.catalogId] = row;
    if (!catalogIds.includes(row.catalogId)) catalogIds.push(row.catalogId);
  }
  const source = rows[0].source;
  return {
    source,
    stamp: hoursStamp(source, catalogIds[0]),
    licensed: true,
    catalogIds,
    bySlug,
  };
}

/**
 * Licensed hours only when a vendor key is present *and* the extract answers.
 * A key without hours, a dead URL, or a miss → typical independent book.
 * Heuristic hours are never stamped Motor / Mitchell / ALLDATA.
 */
export async function loadHoursBook(input: {
  jobKeys: string[];
  year?: string;
  make?: string;
  model?: string;
}): Promise<HoursBook> {
  const jobs = input.jobKeys
    .map((key) => getJob(key))
    .filter((job): job is CatalogJob => Boolean(job));
  const unique = [...new Map(jobs.map((job) => [job.slug, job])).values()];
  if (!unique.length) return typicalHoursBook();

  const keys = licensedHoursKeys();
  const ymm = { year: input.year, make: input.make, model: input.model };

  if (keys.motor) {
    const rows = await fetchVendorHours(
      "Motor",
      envUrl("MOTOR_HOURS_URL"),
      process.env.MOTOR_API_KEY?.trim() ?? "",
      unique,
      ymm,
    );
    if (rows.length) return bookFromRows(rows);
  }
  if (keys.mitchell) {
    const rows = await fetchVendorHours(
      "Mitchell",
      envUrl("MITCHELL_HOURS_URL"),
      process.env.MITCHELL_API_KEY?.trim() ?? "",
      unique,
      ymm,
    );
    if (rows.length) return bookFromRows(rows);
  }
  if (keys.alldata) {
    const rows = await fetchVendorHours(
      "ALLDATA",
      envUrl("ALLDATA_HOURS_URL"),
      process.env.ALLDATA_API_KEY?.trim() ?? "",
      unique,
      ymm,
    );
    if (rows.length) return bookFromRows(rows);
  }

  return typicalHoursBook();
}

export function overlayJobHours(job: CatalogJob, book: HoursBook | null | undefined): CatalogJob {
  const row = book?.bySlug[job.slug] ?? book?.bySlug[job.id];
  if (!row || book?.source === "typical") return job;
  return { ...job, hoursLow: row.hoursLow, hoursHigh: row.hoursHigh };
}

export function hoursRowFor(job: CatalogJob, book: HoursBook | null | undefined): LicensedHoursRow | null {
  if (!book || book.source === "typical") return null;
  return book.bySlug[job.slug] ?? book.bySlug[job.id] ?? null;
}
