import { sortEntries } from "@/lib/service-log/parse";
import {
  SERVICE_LOG_API_PATH,
  SERVICE_LOG_BEGINNER_FIELDS,
  SERVICE_LOG_EXPERT_FIELDS,
  SERVICE_LOG_PRINTOUT_HREF,
  SERVICE_LOG_ROUTE,
  SERVICE_LOG_STORAGE_KEY,
  type ServiceLogCatalog,
  type ServiceLogEntry,
  type ServiceLogExport,
  type ServiceLogFinding,
} from "@/lib/service-log/types";

export const SERVICE_LOG_PRINTOUT_INSTRUCTION =
  "The notebook stays on this device. Open Findings for the customer copy you walk to the window.";

export function serviceLogCatalog(): ServiceLogCatalog {
  return {
    route: SERVICE_LOG_ROUTE,
    storageKey: SERVICE_LOG_STORAGE_KEY,
    api: SERVICE_LOG_API_PATH,
    printout: SERVICE_LOG_PRINTOUT_HREF,
    beginnerFields: SERVICE_LOG_BEGINNER_FIELDS,
    expertFields: SERVICE_LOG_EXPERT_FIELDS,
    note: "Rows live in the browser under openhood.service-log. This endpoint normalizes JSON; it does not store a notebook.",
  };
}

export function buildServiceLogExport(
  entries: ServiceLogEntry[],
  now = new Date(),
): ServiceLogExport {
  const sorted = sortEntries(entries);
  return {
    kind: SERVICE_LOG_STORAGE_KEY,
    storageKey: SERVICE_LOG_STORAGE_KEY,
    route: SERVICE_LOG_ROUTE,
    exportedAt: now.toISOString(),
    entries: sorted,
    findings: sorted.map(entryToFinding),
    printout: {
      href: SERVICE_LOG_PRINTOUT_HREF,
      instruction: SERVICE_LOG_PRINTOUT_INSTRUCTION,
    },
  };
}

export function entryToFinding(entry: ServiceLogEntry): ServiceLogFinding {
  const miles = entry.mileage ? `${Number(entry.mileage).toLocaleString("en-US")} mi` : "";
  const title = [entry.date, miles, entry.what].filter(Boolean).join(" · ");
  const ask = [
    entry.shop ? `Shop ${entry.shop}` : "",
    entry.cost ? `Cost ${entry.cost}` : "",
    entry.oemRo ? `OEM RO ${entry.oemRo}` : "",
    entry.partsSkus?.length ? `SKUs ${entry.partsSkus.join(", ")}` : "",
    entry.notes ?? "",
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(". ");
  return { title, askTheShop: ask };
}

export function serviceLogFilename(exportedAt: string): string {
  const day = exportedAt.slice(0, 10) || "notebook";
  return `openhood-service-log-${day}.json`;
}
