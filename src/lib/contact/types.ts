export const CONTACT_ROLES = [
  { id: "owner", label: "Owner" },
  { id: "diy", label: "DIY" },
  { id: "shop", label: "Shop" },
  { id: "dealer", label: "Dealer" },
  { id: "fleet", label: "Fleet" },
  { id: "other", label: "Other" },
] as const;

export const CONTACT_NEEDS = [
  { id: "quote-review", stamp: "Quote", label: "Quote review" },
  { id: "symptom", stamp: "Noise", label: "Symptom help" },
  { id: "recall", stamp: "Recall", label: "Recall question" },
  { id: "shop-find", stamp: "Shop", label: "Shop find" },
  { id: "partnership", stamp: "Partner", label: "Partnership" },
  { id: "press", stamp: "Press", label: "Press" },
  { id: "other", stamp: "Other", label: "Other" },
] as const;

export const CONTACT_WINDOWS = [
  { id: "morning", label: "Morning", hint: "8–11" },
  { id: "midday", label: "Midday", hint: "11–2" },
  { id: "afternoon", label: "Afternoon", hint: "2–5" },
  { id: "evening", label: "Evening", hint: "5–7" },
  { id: "text", label: "Text is fine", hint: "No call" },
  { id: "anytime", label: "Anytime", hint: "Whenever" },
] as const;

export type ContactRole = (typeof CONTACT_ROLES)[number]["id"];
export type ContactNeed = (typeof CONTACT_NEEDS)[number]["id"];
export type ContactWindow = (typeof CONTACT_WINDOWS)[number]["id"];
export type ContactDelivery = "email" | "local";

export const CONTACT_MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const CONTACT_MAX_MESSAGE = 8000;
export const CONTACT_STORE_RELATIVE = ".data/contact-submissions.jsonl";

export interface ContactPhotoInput {
  mimeType: "image/jpeg";
  base64: string;
  bytes?: number;
}

export interface ContactDraft {
  name: string;
  phone: string;
  email: string;
  role: ContactRole;
  vin: string;
  year: string;
  make: string;
  model: string;
  mileage: string;
  need: ContactNeed;
  message: string;
  window: ContactWindow;
  consent: boolean;
  /** Optional. Public /trust may print name + note. Not a lawyer. Not DPPA. */
  consentToName: boolean;
  photo?: ContactPhotoInput | null;
}

export interface ContactSubmission {
  id: string;
  receivedAt: string;
  name: string;
  phone: string;
  email: string;
  role: ContactRole;
  vin: string;
  year: string;
  make: string;
  model: string;
  mileage: string;
  need: ContactNeed;
  message: string;
  window: ContactWindow;
  consent: true;
  consentToName: boolean;
  photo: { mimeType: "image/jpeg"; bytes: number } | null;
}

/** Public /trust wall only. No phone, email, VIN, or photo. */
export interface ConsentedPublicQuote {
  id: string;
  receivedAt: string;
  name: string;
  role: "shop" | "owner";
  quote: string;
}

export interface ContactSummary {
  title: string;
  lines: string[];
  text: string;
}

export interface ContactMailerStatus {
  delivery: ContactDelivery;
  mailer: "resend" | "none";
  toConfigured: boolean;
}

export interface ContactSubmitResult {
  ok: true;
  id: string;
  receivedAt: string;
  delivery: ContactDelivery;
  notice: string;
  summary: ContactSummary;
  nextDesks: ReadonlyArray<{ href: string; stamp: string; label: string }>;
}

export interface ContactErrorBody {
  ok: false;
  error: string;
  fields?: Partial<Record<keyof ContactDraft, string>>;
}

export class ContactError extends Error {
  status: number;
  fields?: ContactErrorBody["fields"];

  constructor(message: string, status = 400, fields?: ContactErrorBody["fields"]) {
    super(message);
    this.name = "ContactError";
    this.status = status;
    this.fields = fields;
  }
}
