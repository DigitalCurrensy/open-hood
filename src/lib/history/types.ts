import type { NhtsaComplaintSummary, NhtsaRatingRow } from "@/lib/directory/types";
import type { TitleSnapshotStatus } from "@/lib/title-snapshot";
import type { RecallRecord, VehicleSpecs } from "@/lib/types";
import {
  HISTORY_API_PATH,
  HISTORY_LOG_HREF,
  HISTORY_PHOTO_VIN_HREF,
  HISTORY_PLATE_API_PATH,
  HISTORY_ROUTE,
  HISTORY_STATUS_API_PATH,
} from "@/config/nav/history";

export const HISTORY_STORAGE_LOG_KEY = "openhood.service-log" as const;

export const PLATE_DPPA_NOTE =
  "A plate key in env does not turn the decoder on. The desk needs a DPPA / permissible-purpose checkbox. That is your acknowledgment — not a counsel signature. No check → the plate stays a note. We never invent a VIN.";

export const PLATE_DPPA_CHECKBOX =
  "I have a permissible purpose under the U.S. Driver's Privacy Protection Act to look up this plate. This box is my acknowledgment, not a lawyer's stamp, and not Open Hood counsel signing off.";

export const PLATE_VENDOR_KEY_NAMES = ["CARSXE_API_KEY", "MARKETCHECK_API_KEY"] as const;

export const PLATE_DARK_NOTE =
  "No CARSXE_API_KEY or MARKETCHECK_API_KEY. A plate is a note. Photo the VIN on the bay. We do not invent a VIN.";

export class HistoryError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "HistoryError";
    this.status = status;
  }
}

export type HistoryLane = "live" | "link-out";
export type HistoryEventKind = "nhtsa-recall" | "owner-log";
export type HistoryReportKind = "vin" | "portal";
export type HistoryPlateProvider = "carsxe" | "marketcheck";

export interface HistorySourceRow {
  id: string;
  stamp: string;
  label: string;
  lane: HistoryLane;
  detail: string;
}

export interface HistoryLink {
  id: string;
  stamp: string;
  label: string;
  href: string;
  kind: HistoryReportKind | "official";
  detail: string;
}

export interface HistoryOptionField {
  id: string;
  label: string;
  value: string;
  note: string;
}

export interface HistoryTitleRow {
  id: string;
  label: string;
  paidReport: string;
  nhtsa: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  sortKey: string;
  kind: HistoryEventKind;
  source: "NHTSA" | "Owner log";
  title: string;
  detail: string;
  miles?: string;
  campaignNumber?: string;
}

export interface HistoryLiveBlock {
  identity: VehicleSpecs;
  options: HistoryOptionField[];
  optionsNote: string;
  recalls: RecallRecord[];
  complaints: NhtsaComplaintSummary;
  ncap: NhtsaRatingRow[];
  nhtsaEvents: HistoryEvent[];
}

export interface HistoryLinkOutBlock {
  nmvtis: {
    explain: string[];
    links: HistoryLink[];
  };
  reports: HistoryLink[];
  saferCarVin: HistoryLink;
  photoVin: HistoryLink;
}

export interface HistoryDossier {
  ok: true;
  vin: string;
  headline: string;
  disclaimer: string;
  live: HistoryLiveBlock;
  linkOut: HistoryLinkOutBlock;
  titleBrand: {
    intro: string;
    rows: HistoryTitleRow[];
  };
  sources: HistorySourceRow[];
  pulledAt: string;
}

export interface HistoryPlateStatus {
  live: boolean;
  keyPresent: boolean;
  requiresPermissiblePurpose: true;
  carsxe: boolean;
  marketcheck: boolean;
  preferred: HistoryPlateProvider | null;
  keyNames: typeof PLATE_VENDOR_KEY_NAMES;
  note: string;
  photoVinHref: typeof HISTORY_PHOTO_VIN_HREF;
}

export interface HistoryPlateDecode {
  ok: true;
  inventedVin: false;
  provider: HistoryPlateProvider;
  plate: string;
  state: string;
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  notice: string;
  dossier: HistoryDossier | null;
}

export interface HistoryCatalog {
  ok: true;
  route: typeof HISTORY_ROUTE;
  api: typeof HISTORY_API_PATH;
  plateApi: typeof HISTORY_PLATE_API_PATH;
  statusApi: typeof HISTORY_STATUS_API_PATH;
  logHref: typeof HISTORY_LOG_HREF;
  photoVinHref: typeof HISTORY_PHOTO_VIN_HREF;
  plate: HistoryPlateStatus;
  title: TitleSnapshotStatus;
  sources: HistorySourceRow[];
  note: string;
}

export interface HistoryErrorBody {
  ok: false;
  error: string;
}
