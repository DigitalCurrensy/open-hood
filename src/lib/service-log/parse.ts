import {
  SERVICE_LOG_BEGINNER_FIELDS,
  SERVICE_LOG_EXPERT_FIELDS,
  type ServiceLogDraft,
  type ServiceLogEntry,
} from "@/lib/service-log/types";

export class ServiceLogError extends Error {
  status = 400;
}

export function todayIsoDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function emptyDraft(now = new Date()): ServiceLogDraft {
  return {
    date: todayIsoDate(now),
    mileage: "",
    what: "",
    shop: "",
    cost: "",
    notes: "",
    oemRo: "",
    partsSkus: "",
  };
}

export function newEntryId(now = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function parseStoredLog(raw: string | null | undefined): ServiceLogEntry[] {
  if (!raw?.trim()) return [];
  try {
    return normalizeEntries(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

export function normalizeEntries(raw: unknown): ServiceLogEntry[] {
  const rows = extractRows(raw);
  const entries: ServiceLogEntry[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const entry = normalizeEntry(row);
    if (!entry || seen.has(entry.id)) continue;
    seen.add(entry.id);
    entries.push(entry);
  }

  return sortEntries(entries);
}

export function requireEntries(raw: unknown): ServiceLogEntry[] {
  if (raw == null) {
    throw new ServiceLogError("Send JSON: an entry, an entries array, or an export object.");
  }
  return normalizeEntries(raw);
}

export function entryFromDraft(draft: ServiceLogDraft, now = new Date()): ServiceLogEntry {
  const entry = normalizeEntry({
    id: newEntryId(now.getTime()),
    createdAt: now.toISOString(),
    date: draft.date,
    mileage: draft.mileage,
    what: draft.what,
    shop: draft.shop,
    cost: draft.cost,
    notes: draft.notes,
    oemRo: draft.oemRo,
    partsSkus: draft.partsSkus,
  });
  if (!entry) {
    throw new ServiceLogError("Date, miles, and what was done — all three.");
  }
  return entry;
}

export function normalizeEntry(raw: unknown): ServiceLogEntry | null {
  if (!isRecord(raw)) return null;

  const date = normalizeDate(readString(raw, "date") ?? readString(raw, "on"));
  const mileage = normalizeMileage(readString(raw, "mileage") ?? readString(raw, "miles"));
  const what = clean(readString(raw, "what") ?? readString(raw, "whatWasDone") ?? readString(raw, "work"));
  if (!date || !mileage || !what) return null;

  const shop = clean(readString(raw, "shop") ?? readString(raw, "shopName"));
  const cost = normalizeCost(readString(raw, "cost") ?? readNumber(raw, "cost"));
  const notes = clean(readString(raw, "notes"));
  const oemRo = clean(readString(raw, "oemRo") ?? readString(raw, "ro") ?? readString(raw, "roNumber"));
  const partsSkus = normalizeSkus(raw.partsSkus ?? raw.skus ?? raw.parts);

  const createdAt = normalizeIso(readString(raw, "createdAt")) ?? `${date}T12:00:00.000Z`;
  const id = clean(readString(raw, "id")) ?? `${date}-${mileage}-${slug(what)}`;

  const entry: ServiceLogEntry = { id, date, mileage, what, createdAt };
  if (shop) entry.shop = shop;
  if (cost) entry.cost = cost;
  if (notes) entry.notes = notes;
  if (oemRo) entry.oemRo = oemRo;
  if (partsSkus.length) entry.partsSkus = partsSkus;
  return entry;
}

export function sortEntries(entries: ServiceLogEntry[]): ServiceLogEntry[] {
  return [...entries].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date);
    if (byDate) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function formatMiles(mileage: string): string {
  const digits = mileage.replace(/\D/g, "");
  if (!digits) return mileage;
  return Number(digits).toLocaleString("en-US");
}

export function formatCost(cost: string): string {
  const trimmed = cost.trim();
  if (!trimmed) return "";
  if (/^\$/.test(trimmed)) return trimmed;
  const numeric = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return trimmed;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(numeric);
}

export function fieldGuide() {
  return {
    beginner: SERVICE_LOG_BEGINNER_FIELDS,
    expert: SERVICE_LOG_EXPERT_FIELDS,
  };
}

function extractRows(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!isRecord(raw)) return [];
  if (Array.isArray(raw.entries)) return raw.entries;
  if (isRecord(raw.entry)) return [raw.entry];
  if (looksLikeEntry(raw)) return [raw];
  return [];
}

function looksLikeEntry(raw: Record<string, unknown>): boolean {
  return Boolean(raw.date || raw.mileage || raw.what || raw.whatWasDone);
}

function normalizeDate(value: string | undefined): string | undefined {
  const raw = clean(value);
  if (!raw) return undefined;
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const date = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T12:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : `${iso[1]}-${iso[2]}-${iso[3]}`;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return todayIsoDate(parsed);
}

function normalizeMileage(value: string | undefined): string | undefined {
  const raw = clean(value);
  if (!raw) return undefined;
  const digits = raw.replace(/\D/g, "");
  return digits || undefined;
}

function normalizeCost(value: string | undefined): string | undefined {
  const raw = clean(value);
  if (!raw) return undefined;
  const numeric = Number(raw.replace(/[$,]/g, ""));
  if (Number.isFinite(numeric)) {
    return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
  }
  return raw;
}

function normalizeSkus(value: unknown): string[] {
  const parts = Array.isArray(value)
    ? value.map((row) => (typeof row === "string" || typeof row === "number" ? String(row) : ""))
    : typeof value === "string"
      ? value.split(/[,;\n]+/)
      : [];
  const seen = new Set<string>();
  const skus: string[] = [];
  for (const part of parts) {
    const sku = part.trim().replace(/\s+/g, " ");
    if (!sku || seen.has(sku)) continue;
    seen.add(sku);
    skus.push(sku);
  }
  return skus;
}

function normalizeIso(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "line";
}

function readString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : undefined;
}

function readNumber(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? String(value) : undefined;
}

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const next = value.trim();
  return next ? next : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
