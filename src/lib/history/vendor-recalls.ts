import { PLATE_VENDOR_KEY_NAMES } from "@/lib/history/types";
import type { RecallRecord } from "@/lib/types";
import { isValidVin, normalizeVin } from "@/lib/vin";

export { PLATE_VENDOR_KEY_NAMES };

function envOn(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

/** CarsXE public Vehicle Recalls API — https://api.carsxe.com/docs/v1/vehicle-recalls */
const CARSXE_RECALLS_URL = "https://api.carsxe.com/v1/recalls";

export const VENDOR_RECALL_STAMP = "vendor file · not NHTSA public recallsByVin (403)";

export function plateVendorKeysOn(): boolean {
  return envOn("CARSXE_API_KEY") || envOn("MARKETCHECK_API_KEY");
}

/** VIN-true campaign file is CarsXE `/v1/recalls`. MarketCheck unlocks plate only. */
export function vendorRecallKeyOn(): boolean {
  return envOn("CARSXE_API_KEY");
}

export type VendorRecallPull = {
  ok: boolean;
  provider: "carsxe" | null;
  rows: RecallRecord[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function readString(source: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function extractRecallRows(payload: unknown): RecallRecord[] {
  const root = asRecord(payload);
  if (!root) return [];
  const data = asRecord(root.data) ?? root;
  const list = data.recalls ?? data.campaigns ?? root.recalls ?? root.campaigns;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const campaignNumber = readString(row, "nhtsa_id", "nhtsaId", "campaignNumber", "campaign_number", "NHTSACampaignNumber");
    const component =
      readString(row, "component", "Component", "recall_name", "recallName") || "Unspecified";
    const status = readString(row, "recall_status", "recallStatus", "status");
    const summary = [readString(row, "recall_description", "recallDescription", "summary", "Summary"), status && `Status: ${status}`]
      .filter(Boolean)
      .join(" · ");
    return [
      {
        campaignNumber,
        component,
        summary,
        consequence: readString(row, "risk_description", "riskDescription", "consequence", "Consequence"),
        remedy: readString(row, "recall_remedy", "recallRemedy", "remedy", "Remedy"),
        reportReceivedDate: readString(row, "recall_date", "recallDate", "reportReceivedDate", "ReportReceivedDate"),
      },
    ];
  });
}

export async function fetchVendorVinRecalls(vin: string): Promise<VendorRecallPull> {
  const clean = normalizeVin(vin);
  if (!isValidVin(clean) || !vendorRecallKeyOn()) {
    return { ok: false, provider: null, rows: [] };
  }
  const key = process.env.CARSXE_API_KEY?.trim();
  if (!key) return { ok: false, provider: null, rows: [] };

  const params = new URLSearchParams({ key, vin: clean });
  try {
    const response = await fetch(`${CARSXE_RECALLS_URL}?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "OpenHood/0.1 (history-desk; vin-recalls)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
    if (response.status === 401 || response.status === 403 || !response.ok) {
      return { ok: false, provider: "carsxe", rows: [] };
    }
    const rows = extractRecallRows(await response.json());
    return { ok: true, provider: "carsxe", rows };
  } catch {
    return { ok: false, provider: "carsxe", rows: [] };
  }
}

export function mergeNameplateAndVendorRecalls(ymm: RecallRecord[], vendor: RecallRecord[]): RecallRecord[] {
  const seen = new Set<string>();
  const out: RecallRecord[] = [];
  for (const row of [...vendor, ...ymm]) {
    const key = row.campaignNumber.trim().toUpperCase() || `__${row.component}:${row.summary.slice(0, 48)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out.slice(0, 40);
}
