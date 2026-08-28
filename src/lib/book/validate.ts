import { isValidVin, normalizeVin } from "@/lib/vin";
import {
  BOOK_JOBS,
  BOOK_MAX_NOTES,
  BOOK_VENUES,
  BOOK_WINDOWS,
  BookError,
  type BookDraft,
  type BookJob,
  type BookRequest,
  type BookVenue,
  type BookWindow,
} from "@/lib/book/types";

const JOB_IDS = new Set<string>(BOOK_JOBS.map((row) => row.id));
const VENUE_IDS = new Set<string>(BOOK_VENUES.map((row) => row.id));
const WINDOW_IDS = new Set<string>(BOOK_WINDOWS.map((row) => row.id));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_RE = /^\d{5}$/;
const YEAR_MIN = 1950;

export function emptyBookDraft(): BookDraft {
  return {
    name: "",
    phone: "",
    email: "",
    zip: "",
    job: "brakes",
    notes: "",
    venue: "shop",
    window: "first-open",
    vin: "",
    year: "",
    make: "",
    model: "",
    mileage: "",
    consent: false,
  };
}

export function parseBookBody(raw: unknown): BookDraft {
  if (!isRecord(raw)) {
    throw new BookError("Send JSON: job, ZIP, vehicle, window, and shop / mobile / dealer.");
  }

  return {
    name: asText(raw.name),
    phone: asText(raw.phone),
    email: asText(raw.email),
    zip: asText(raw.zip ?? raw.postal),
    job: asText(raw.job) as BookDraft["job"],
    notes: asText(raw.notes ?? raw.message ?? raw.jobNotes),
    venue: asText(raw.venue ?? raw.where) as BookDraft["venue"],
    window: asText(raw.window ?? raw.preferredWindow) as BookDraft["window"],
    vin: asText(raw.vin),
    year: asText(raw.year),
    make: asText(raw.make),
    model: asText(raw.model),
    mileage: asText(raw.mileage),
    consent: raw.consent === true || raw.consent === "true" || raw.consent === "on",
  };
}

export function validateBook(draft: BookDraft): BookRequest {
  const fields: NonNullable<BookError["fields"]> = {};

  const name = draft.name.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) {
    fields.name = "Name on the ticket — two characters at least.";
  }

  const phone = draft.phone.trim();
  const phoneDigits = phone.replace(/\D/g, "");
  if (phone && (phoneDigits.length < 10 || phoneDigits.length > 15)) {
    fields.phone = "That is not a reachable number. Ten digits, or leave it blank and use email.";
  }

  const email = draft.email.trim().toLowerCase();
  if (email && (email.length > 120 || !EMAIL_RE.test(email))) {
    fields.email = "That email will not bounce back to you. Fix it or leave it blank and use a phone.";
  }

  if (!phoneDigits && !email) {
    fields.phone = "Phone or email — a rooftop needs a way back.";
    fields.email = "Phone or email — a rooftop needs a way back.";
  }

  const zip = draft.zip.trim().replace(/\D/g, "").slice(0, 5);
  if (!ZIP_RE.test(zip)) {
    fields.zip = "ZIP is five digits. That is how we pin a rooftop.";
  }

  const job = draft.job;
  if (!JOB_IDS.has(job)) {
    fields.job = "Pick the job — brakes, diagnosis, oil, or other.";
  }

  const venue = draft.venue;
  if (!VENUE_IDS.has(venue)) {
    fields.venue = "Pick shop, mobile, or dealer. We do not send a van.";
  }

  const window = draft.window;
  if (!WINDOW_IDS.has(window)) {
    fields.window = "Pick a preferred window.";
  }

  const vinRaw = draft.vin.trim();
  const vin = vinRaw ? normalizeVin(vinRaw) : "";
  if (vinRaw && !isValidVin(vin)) {
    fields.vin = "A VIN is 17 characters. I, O, and Q are not used. Leave it blank if you do not have it.";
  }

  const year = draft.year.trim();
  const yearNum = Number.parseInt(year, 10);
  const yearMax = new Date().getFullYear() + 1;
  if (year && (!/^\d{4}$/.test(year) || yearNum < YEAR_MIN || yearNum > yearMax)) {
    fields.year = `Year is four digits between ${YEAR_MIN} and ${yearMax}, or blank.`;
  }

  const make = clip(draft.make, 40);
  const model = clip(draft.model, 40);
  if (draft.make.trim().length > 40) fields.make = "Make is 40 characters or less.";
  if (draft.model.trim().length > 40) fields.model = "Model is 40 characters or less.";

  const hasVehicle = Boolean(vin || (year && make) || (make && model));
  if (!hasVehicle) {
    fields.make = "Year + make, make + model, or a VIN. A rooftop needs a nameplate.";
  }

  const mileageDigits = draft.mileage.replace(/[^\d]/g, "");
  if (draft.mileage.trim() && !mileageDigits) {
    fields.mileage = "Mileage is digits, or blank.";
  }
  const mileageNum = mileageDigits ? Number.parseInt(mileageDigits, 10) : NaN;
  if (mileageDigits && (!Number.isFinite(mileageNum) || mileageNum < 0 || mileageNum > 2_000_000)) {
    fields.mileage = "Mileage is the odometer. Under two million, or blank.";
  }

  const notes = draft.notes.trim();
  if (notes.length > BOOK_MAX_NOTES) {
    fields.notes = "Keep the job notes under 4,000 characters.";
  }
  if (job === "other" && notes.length < 8) {
    fields.notes = "Other needs a sentence. What should they look at?";
  }

  if (!draft.consent) {
    fields.consent = "Check the box: we send your request; we don't send a mechanic.";
  }

  if (Object.keys(fields).length) {
    throw new BookError(Object.values(fields)[0] ?? "The request is incomplete.", 400, fields);
  }

  return {
    id: newBookId(),
    receivedAt: new Date().toISOString(),
    name,
    phone: phoneDigits ? formatPhone(phoneDigits) : "",
    email,
    zip,
    job: job as BookJob,
    notes,
    venue: venue as BookVenue,
    window: window as BookWindow,
    vin,
    year: year || "",
    make,
    model,
    mileage: mileageDigits,
    consent: true,
    dispatched: false,
  };
}

export function newBookId(): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `bk_${stamp}_${rand}`;
}

function formatPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 ${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

function clip(value: string, max: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
