import { formatMiles, sortEntries } from "@/lib/service-log/parse";
import type { ServiceLogEntry } from "@/lib/service-log/types";
import type { HistoryEvent } from "@/lib/history/types";
import type { RecallRecord } from "@/lib/types";

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function isoIfValid(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const iso = `${year}-${pad2(month)}-${pad2(day)}`;
  const parsed = new Date(`${iso}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : iso;
}

function recallDate(raw: string): { date: string; sortKey: string } {
  const trimmed = raw.trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const iso = isoIfValid(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
    if (iso) return { date: iso, sortKey: iso };
  }

  const slash = trimmed.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (slash) {
    const first = Number(slash[1]);
    const second = Number(slash[2]);
    const year = Number(slash[3]);
    // NHTSA recallsByVehicle uses DD/MM/YYYY (27/06/2019). Fall back to MM/DD when day would be impossible.
    const dmy = isoIfValid(year, second, first);
    const mdy = isoIfValid(year, first, second);
    const iso = first > 12 ? dmy : second > 12 ? mdy : dmy ?? mdy;
    if (iso) return { date: iso, sortKey: iso };
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime()) && trimmed) {
    const iso = parsed.toISOString().slice(0, 10);
    return { date: iso, sortKey: iso };
  }
  return { date: trimmed || "Date not on the campaign", sortKey: "9999-12-31" };
}

export function eventsFromRecalls(recalls: RecallRecord[]): HistoryEvent[] {
  return recalls.map((row, index) => {
    const when = recallDate(row.reportReceivedDate);
    const campaign = row.campaignNumber || `recall-${index}`;
    return {
      id: `nhtsa-${campaign}`,
      date: when.date,
      sortKey: when.sortKey,
      kind: "nhtsa-recall",
      source: "NHTSA",
      title: row.component || "Campaign",
      detail: row.summary || row.remedy || "NHTSA campaign on this nameplate.",
      campaignNumber: row.campaignNumber || undefined,
    };
  });
}

export function eventsFromServiceLog(entries: ServiceLogEntry[]): HistoryEvent[] {
  return sortEntries(entries).map((entry) => ({
    id: `log-${entry.id}`,
    date: entry.date,
    sortKey: entry.date,
    kind: "owner-log" as const,
    source: "Owner log" as const,
    title: entry.what,
    detail: [entry.shop, entry.oemRo ? `RO ${entry.oemRo}` : "", entry.notes].filter(Boolean).join(" · "),
    miles: entry.mileage ? formatMiles(entry.mileage) : undefined,
  }));
}

/** Oldest first. NHTSA campaigns + owner notebook. No invented accidents. */
export function mergeHistoryTimeline(recalls: RecallRecord[], entries: ServiceLogEntry[]): HistoryEvent[] {
  const merged = [...eventsFromRecalls(recalls), ...eventsFromServiceLog(entries)];
  return merged.sort((a, b) => {
    const byDate = a.sortKey.localeCompare(b.sortKey);
    if (byDate) return byDate;
    if (a.kind === b.kind) return a.title.localeCompare(b.title);
    return a.kind === "nhtsa-recall" ? -1 : 1;
  });
}
