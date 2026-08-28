import { isValidVin, normalizeVin } from "@/lib/vin";
import {
  CONTACT_MAX_MESSAGE,
  CONTACT_MAX_PHOTO_BYTES,
  CONTACT_NEEDS,
  CONTACT_ROLES,
  CONTACT_WINDOWS,
  ContactError,
  type ContactDraft,
  type ContactNeed,
  type ContactPhotoInput,
  type ContactRole,
  type ContactSubmission,
  type ContactWindow,
} from "@/lib/contact/types";

const ROLE_IDS = new Set<string>(CONTACT_ROLES.map((row) => row.id));
const NEED_IDS = new Set<string>(CONTACT_NEEDS.map((row) => row.id));
const WINDOW_IDS = new Set<string>(CONTACT_WINDOWS.map((row) => row.id));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const YEAR_MIN = 1950;

export function emptyContactDraft(): ContactDraft {
  return {
    name: "",
    phone: "",
    email: "",
    role: "owner",
    vin: "",
    year: "",
    make: "",
    model: "",
    mileage: "",
    need: "quote-review",
    message: "",
    window: "anytime",
    consent: false,
    consentToName: false,
    photo: null,
  };
}

export function parseContactBody(raw: unknown): ContactDraft {
  if (!isRecord(raw)) {
    throw new ContactError("Send JSON: name, a phone or email, and the RO.");
  }

  return {
    name: asText(raw.name),
    phone: asText(raw.phone),
    email: asText(raw.email),
    role: asText(raw.role) as ContactDraft["role"],
    vin: asText(raw.vin),
    year: asText(raw.year),
    make: asText(raw.make),
    model: asText(raw.model),
    mileage: asText(raw.mileage),
    need: asText(raw.need) as ContactDraft["need"],
    message: asText(raw.message),
    window: asText(raw.window ?? raw.callback) as ContactDraft["window"],
    consent: raw.consent === true || raw.consent === "true" || raw.consent === "on",
    consentToName: raw.consentToName === true || raw.consentToName === "true" || raw.consentToName === "on",
    photo: parsePhoto(raw.photo),
  };
}

export function validateContact(draft: ContactDraft): ContactSubmission {
  const fields: NonNullable<ContactError["fields"]> = {};

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
    fields.phone = "Phone or email — we need a way back.";
    fields.email = "Phone or email — we need a way back.";
  }

  const role = draft.role;
  if (!ROLE_IDS.has(role)) {
    fields.role = "Pick who you are: owner, DIY, shop, dealer, fleet, or other.";
  }

  const need = draft.need;
  if (!NEED_IDS.has(need)) {
    fields.need = "Pick what you need — quote, symptom, recall, shop, partnership, press, or other.";
  }

  const window = draft.window;
  if (!WINDOW_IDS.has(window)) {
    fields.window = "Pick a callback window.";
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

  const mileageDigits = draft.mileage.replace(/[^\d]/g, "");
  if (draft.mileage.trim() && !mileageDigits) {
    fields.mileage = "Mileage is digits, or blank.";
  }
  const mileageNum = mileageDigits ? Number.parseInt(mileageDigits, 10) : NaN;
  if (mileageDigits && (!Number.isFinite(mileageNum) || mileageNum < 0 || mileageNum > 2_000_000)) {
    fields.mileage = "Mileage is the odometer, not a wish. Under two million, or blank.";
  }

  const message = draft.message.trim();
  if (message.length > CONTACT_MAX_MESSAGE) {
    fields.message = "The paste is too long. Keep the RO under 8,000 characters.";
  }

  const photo = normalizePhoto(draft.photo);
  if (draft.photo && !photo) {
    fields.photo = "Photo of the estimate must be a JPEG under 4 MB.";
  }
  if ((need === "partnership" || need === "press") && message.length < 12) {
    fields.message = "Say what you need in a sentence. We do not book shops or sell a feed.";
  }

  if (!draft.consent) {
    fields.consent = "Check the box: we do not sell this RO.";
  }

  if (Object.keys(fields).length) {
    throw new ContactError(Object.values(fields)[0] ?? "The ticket is incomplete.", 400, fields);
  }

  return {
    id: newContactId(),
    receivedAt: new Date().toISOString(),
    name,
    phone: phoneDigits ? formatPhone(phoneDigits) : "",
    email,
    role: role as ContactRole,
    vin,
    year: year || "",
    make,
    model,
    mileage: mileageDigits,
    need: need as ContactNeed,
    message,
    window: window as ContactWindow,
    consent: true,
    consentToName: draft.consentToName === true,
    photo,
  };
}

export function newContactId(): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `ro_${stamp}_${rand}`;
}

function parsePhoto(raw: unknown): ContactPhotoInput | null {
  if (raw == null || raw === false) return null;
  if (!isRecord(raw)) return { mimeType: "image/jpeg", base64: "" };
  const mime = typeof raw.mimeType === "string" ? raw.mimeType : "image/jpeg";
  const dataUrl = typeof raw.dataUrl === "string" ? raw.dataUrl : "";
  const fromUrl = dataUrl.includes(",") ? (dataUrl.split(",", 2)[1] ?? "") : "";
  const base64 = typeof raw.base64 === "string" && raw.base64 ? raw.base64 : fromUrl;
  const bytes = typeof raw.bytes === "number" ? raw.bytes : undefined;
  return { mimeType: mime === "image/jpeg" ? "image/jpeg" : (mime as "image/jpeg"), base64, bytes };
}

function normalizePhoto(photo: ContactPhotoInput | null | undefined): ContactSubmission["photo"] {
  if (!photo) return null;
  const base64 = stripDataUrl(photo.base64);
  if (!base64) return null;
  if (photo.mimeType !== "image/jpeg") return null;
  if (!/^[A-Za-z0-9+/]+=*$/.test(base64.slice(0, 80)) && !/^[A-Za-z0-9+/]/.test(base64)) return null;
  const bytes = photo.bytes && photo.bytes > 0 ? photo.bytes : Math.round((base64.length * 3) / 4);
  if (bytes <= 0 || bytes > CONTACT_MAX_PHOTO_BYTES) return null;
  return { mimeType: "image/jpeg", bytes };
}

export function photoBase64(photo: ContactPhotoInput | null | undefined): string {
  if (!photo) return "";
  return stripDataUrl(photo.base64);
}

function stripDataUrl(value: string): string {
  const trimmed = value.trim();
  const comma = trimmed.indexOf(",");
  if (trimmed.startsWith("data:") && comma !== -1) return trimmed.slice(comma + 1).replace(/\s/g, "");
  return trimmed.replace(/\s/g, "");
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
