export const BOOK_JOBS = [
  { id: "brakes", stamp: "Brakes", label: "Brakes / rotors" },
  { id: "diag", stamp: "Diag", label: "Check-engine / diagnosis" },
  { id: "oil", stamp: "LOF", label: "Oil / filter" },
  { id: "battery", stamp: "12V", label: "Battery / no-start" },
  { id: "tires", stamp: "Tires", label: "Tires / TPMS" },
  { id: "alignment", stamp: "Align", label: "Alignment" },
  { id: "ac", stamp: "A/C", label: "A/C / heat" },
  { id: "recall", stamp: "Recall", label: "Dealer recall" },
  { id: "inspect", stamp: "Inspect", label: "Inspection / PPI" },
  { id: "other", stamp: "Other", label: "Other — describe it" },
] as const;

export const BOOK_VENUES = [
  {
    id: "shop",
    stamp: "Shop",
    label: "Independent shop",
    hint: "A rooftop. You call.",
  },
  {
    id: "mobile",
    stamp: "Van",
    label: "Mobile mechanic",
    hint: "They send a van. We don't.",
  },
  {
    id: "dealer",
    stamp: "Dealer",
    label: "Dealer service",
    hint: "OEM locator. Their bay.",
  },
] as const;

export const BOOK_WINDOWS = [
  { id: "morning", label: "Morning", hint: "8–11" },
  { id: "midday", label: "Midday", hint: "11–2" },
  { id: "afternoon", label: "Afternoon", hint: "2–5" },
  { id: "evening", label: "Evening", hint: "5–7" },
  { id: "first-open", label: "First open", hint: "Whenever" },
  { id: "weekend", label: "Weekend", hint: "Sat / Sun" },
] as const;

export type BookJob = (typeof BOOK_JOBS)[number]["id"];
export type BookVenue = (typeof BOOK_VENUES)[number]["id"];
export type BookWindow = (typeof BOOK_WINDOWS)[number]["id"];
export type BookDelivery = "email" | "local";

export const BOOK_MAX_NOTES = 4000;
export const BOOK_STORE_RELATIVE = ".data/book-requests.jsonl";
export const BOOK_DISPATCH_LINE = "We send your request; we don't send a mechanic.";

export interface BookDraft {
  name: string;
  phone: string;
  email: string;
  zip: string;
  job: BookJob;
  notes: string;
  venue: BookVenue;
  window: BookWindow;
  vin: string;
  year: string;
  make: string;
  model: string;
  mileage: string;
  consent: boolean;
}

export interface BookRequest {
  id: string;
  receivedAt: string;
  name: string;
  phone: string;
  email: string;
  zip: string;
  job: BookJob;
  notes: string;
  venue: BookVenue;
  window: BookWindow;
  vin: string;
  year: string;
  make: string;
  model: string;
  mileage: string;
  consent: true;
  dispatched: false;
}

export interface BookSummary {
  title: string;
  lines: string[];
  text: string;
}

export interface BookMailerStatus {
  delivery: BookDelivery;
  mailer: "resend" | "none";
  toConfigured: boolean;
  dispatched: false;
}

export interface BookDealerLink {
  id: string;
  label: string;
  href: string;
  kind: "locator" | "schedule" | "association" | "maps";
  note: string;
}

export interface BookSubmitResult {
  ok: true;
  id: string;
  receivedAt: string;
  delivery: BookDelivery;
  dispatched: false;
  stored: "email" | "jsonl";
  notice: string;
  summary: BookSummary;
  nextDesks: ReadonlyArray<{ href: string; stamp: string; label: string }>;
  directoryHref: string;
  dealerLinks: BookDealerLink[];
}

export interface BookErrorBody {
  ok: false;
  error: string;
  fields?: Partial<Record<keyof BookDraft, string>>;
}

export interface BookBoardRow {
  id: string;
  receivedAt: string;
  job: BookJob;
  zip: string;
  venue: BookVenue;
  window: BookWindow;
  vehicle: string;
  delivery: BookDelivery;
  dispatched: false;
  status: "sent";
}

export class BookError extends Error {
  status: number;
  fields?: BookErrorBody["fields"];

  constructor(message: string, status = 400, fields?: BookErrorBody["fields"]) {
    super(message);
    this.name = "BookError";
    this.status = status;
    this.fields = fields;
  }
}
