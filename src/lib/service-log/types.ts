export const SERVICE_LOG_STORAGE_KEY = "openhood.service-log" as const;
export const SERVICE_LOG_ROUTE = "/log" as const;
export const SERVICE_LOG_API_PATH = "/api/log" as const;
export const SERVICE_LOG_PRINTOUT_HREF = "/report" as const;
export const SERVICE_LOG_EVENT = "openhood:service-log" as const;

export const SERVICE_LOG_BEGINNER_FIELDS = ["date", "mileage", "what"] as const;
export const SERVICE_LOG_EXPERT_FIELDS = ["shop", "cost", "notes", "oemRo", "partsSkus"] as const;

export interface ServiceLogEntry {
  id: string;
  date: string;
  mileage: string;
  what: string;
  shop?: string;
  cost?: string;
  notes?: string;
  oemRo?: string;
  partsSkus?: string[];
  createdAt: string;
}

export interface ServiceLogDraft {
  date: string;
  mileage: string;
  what: string;
  shop: string;
  cost: string;
  notes: string;
  oemRo: string;
  partsSkus: string;
}

export interface ServiceLogFinding {
  title: string;
  askTheShop: string;
}

export interface ServiceLogPrintout {
  href: typeof SERVICE_LOG_PRINTOUT_HREF;
  instruction: string;
}

export interface ServiceLogExport {
  kind: typeof SERVICE_LOG_STORAGE_KEY;
  storageKey: typeof SERVICE_LOG_STORAGE_KEY;
  route: typeof SERVICE_LOG_ROUTE;
  exportedAt: string;
  entries: ServiceLogEntry[];
  findings: ServiceLogFinding[];
  printout: ServiceLogPrintout;
}

export interface ServiceLogCatalog {
  route: typeof SERVICE_LOG_ROUTE;
  storageKey: typeof SERVICE_LOG_STORAGE_KEY;
  api: typeof SERVICE_LOG_API_PATH;
  printout: typeof SERVICE_LOG_PRINTOUT_HREF;
  beginnerFields: typeof SERVICE_LOG_BEGINNER_FIELDS;
  expertFields: typeof SERVICE_LOG_EXPERT_FIELDS;
  note: string;
}
