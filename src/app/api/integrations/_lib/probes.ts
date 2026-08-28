import { osmHeaders } from "@/lib/directory/http";
import type { ProbeRow } from "@/app/integrations/bay-types";

const HONDA_VIN = "1HGCM82633A004352";
const PROBE_TTL_MS = 60_000;

let cache: { at: number; rows: ProbeRow[] } | null = null;

async function timed(
  id: string,
  label: string,
  work: () => Promise<{ ok: boolean; status: number | null; note: string }>,
): Promise<ProbeRow> {
  const started = Date.now();
  try {
    const result = await work();
    return { id, label, ms: Date.now() - started, ...result };
  } catch (error) {
    return {
      id,
      label,
      ok: false,
      status: null,
      ms: Date.now() - started,
      note: error instanceof Error ? error.message.slice(0, 160) : "Probe dropped.",
    };
  }
}

export async function probePublicPipes(force = false): Promise<ProbeRow[]> {
  if (!force && cache && Date.now() - cache.at < PROBE_TTL_MS) return cache.rows;

  const rows = await Promise.all([
    timed("nhtsa-vpic", "NHTSA vPIC", async () => {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${HONDA_VIN}?format=json`,
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8_000), cache: "no-store" },
      );
      if (!response.ok) {
        return { ok: false, status: response.status, note: `vPIC returned ${response.status}.` };
      }
      const body = (await response.json()) as { Results?: Array<{ Make?: string; Model?: string; ModelYear?: string }> };
      const row = body.Results?.[0];
      const make = (row?.Make ?? "").trim();
      if (!make) return { ok: false, status: response.status, note: "vPIC answered without a Make." };
      return {
        ok: true,
        status: response.status,
        note: `${row?.ModelYear ?? ""} ${make} ${row?.Model ?? ""}`.trim() + " — public decode, no key.",
      };
    }),
    timed("nhtsa-recallsByVin", "SaferCar VIN-true (403)", async () => {
      const response = await fetch(`https://api.nhtsa.gov/recalls/recallsByVin?vin=${HONDA_VIN}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      if (response.status === 403) {
        return {
          ok: false,
          status: 403,
          note: "recallsByVin is 403. Open vs closed stays on nhtsa.gov/recalls. We do not parse SaferCar HTML.",
        };
      }
      return {
        ok: false,
        status: response.status,
        note: `recallsByVin returned ${response.status}. Still not a close-out we will invent.`,
      };
    }),
    timed("osm-nominatim", "OSM Nominatim", async () => {
      const response = await fetch("https://nominatim.openstreetmap.org/status", {
        headers: osmHeaders(),
        signal: AbortSignal.timeout(6_000),
        cache: "no-store",
      });
      const text = (await response.text()).slice(0, 80).trim();
      const ok = response.ok && /ok/i.test(text);
      return {
        ok,
        status: response.status,
        note: ok ? "Nominatim status OK. 1 req/s. User-Agent required." : `Nominatim status: ${text || response.status}`,
      };
    }),
    timed("epa-mpg", "FuelEconomy.gov", async () => {
      const response = await fetch("https://www.fueleconomy.gov/ws/rest/vehicle/menu/year", {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      if (!response.ok) {
        return { ok: false, status: response.status, note: `FuelEconomy.gov returned ${response.status}.` };
      }
      const body = (await response.json()) as { menuItem?: unknown };
      const items = Array.isArray(body.menuItem) ? body.menuItem.length : body.menuItem ? 1 : 0;
      return {
        ok: items > 0,
        status: response.status,
        note: items > 0 ? `Year menu has ${items} rows. Official MPG, no key.` : "Year menu was empty.",
      };
    }),
  ]);

  cache = { at: Date.now(), rows };
  return rows;
}
