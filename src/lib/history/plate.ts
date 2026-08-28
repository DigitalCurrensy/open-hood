import { US_STATES } from "@/lib/us-states";
import { isValidVin, normalizeVin } from "@/lib/vin";
import { assembleDossier } from "@/lib/history/dossier";
import {
  HistoryError,
  PLATE_DARK_NOTE,
  PLATE_DPPA_NOTE,
  PLATE_VENDOR_KEY_NAMES,
  type HistoryPlateDecode,
  type HistoryPlateProvider,
  type HistoryPlateStatus,
} from "@/lib/history/types";
import { HISTORY_PHOTO_VIN_HREF } from "@/config/nav/history";

const STATE_CODES = new Set(US_STATES.map((row) => row.code));

const CARSXE_URL = "https://api.carsxe.com/platedecoder";
const MARKETCHECK_URL = "https://api.marketcheck.com/v2/carsxe/plate-decoder";

export function envOn(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export type PlateDecodeRequest = {
  plate?: string;
  state?: string;
  permissiblePurpose?: boolean;
  dppaAck?: boolean;
};

export function hasPermissiblePurpose(raw: PlateDecodeRequest | null | undefined): boolean {
  return raw?.permissiblePurpose === true || raw?.dppaAck === true;
}

export function plateStatus(): HistoryPlateStatus {
  const carsxe = envOn("CARSXE_API_KEY");
  const marketcheck = envOn("MARKETCHECK_API_KEY");
  const preferred: HistoryPlateProvider | null = carsxe ? "carsxe" : marketcheck ? "marketcheck" : null;
  const keyPresent = Boolean(preferred);
  return {
    live: keyPresent,
    keyPresent,
    requiresPermissiblePurpose: true,
    carsxe,
    marketcheck,
    preferred,
    keyNames: PLATE_VENDOR_KEY_NAMES,
    note: keyPresent ? PLATE_DPPA_NOTE : PLATE_DARK_NOTE,
    photoVinHref: HISTORY_PHOTO_VIN_HREF,
  };
}

export function normalizePlate(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
}

export function normalizeState(raw: string): string {
  return raw.trim().toUpperCase().slice(0, 2);
}

export function parsePlateInput(raw: { plate?: string; state?: string }): { plate: string; state: string } {
  const plate = normalizePlate(raw.plate ?? "");
  const state = normalizeState(raw.state ?? "");
  if (plate.length < 2) {
    throw new HistoryError("US plate, two characters or more after you strip the dashes.");
  }
  if (!STATE_CODES.has(state)) {
    throw new HistoryError("Pick a US state. Plate-to-VIN is not a guess.");
  }
  return { plate, state };
}

function readString(source: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function extractPlateVehicle(payload: unknown): {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
} {
  const root = asRecord(payload);
  if (!root) throw new HistoryError("Plate decoder returned an empty body.", 502);

  const nested = asRecord(root.data) ?? asRecord(root.result) ?? asRecord(root.vehicle) ?? root;
  const vin = normalizeVin(readString(nested, "vin", "VIN", "Vin"));
  return {
    vin,
    year: readString(nested, "year", "modelYear", "model_year"),
    make: readString(nested, "make", "Make"),
    model: readString(nested, "model", "Model"),
    trim: readString(nested, "trim", "Trim"),
  };
}

async function fetchPlateJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "OpenHood/0.1 (history-desk; plate-decode)",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });
  if (response.status === 401 || response.status === 403) {
    throw new HistoryError("Plate decoder rejected the key. Check the commercial account.", 502);
  }
  if (response.status === 404 || response.status === 422) {
    throw new HistoryError("That plate + state did not hit a vehicle. Photo the VIN on the bay.", 404);
  }
  if (!response.ok) {
    throw new HistoryError(`Plate decoder returned ${response.status}.`, 502);
  }
  return response.json();
}

async function decodeCarsXe(plate: string, state: string): Promise<ReturnType<typeof extractPlateVehicle>> {
  const key = process.env.CARSXE_API_KEY?.trim();
  if (!key) throw new HistoryError("CARSXE_API_KEY is not set.", 503);
  const params = new URLSearchParams({ key, plate, state, country: "US", format: "json" });
  return extractPlateVehicle(await fetchPlateJson(`${CARSXE_URL}?${params.toString()}`));
}

async function decodeMarketcheck(plate: string, state: string): Promise<ReturnType<typeof extractPlateVehicle>> {
  const key = process.env.MARKETCHECK_API_KEY?.trim();
  if (!key) throw new HistoryError("MARKETCHECK_API_KEY is not set.", 503);
  const params = new URLSearchParams({ api_key: key, country: "US", state });
  return extractPlateVehicle(
    await fetchPlateJson(`${MARKETCHECK_URL}/${encodeURIComponent(plate)}?${params.toString()}`),
  );
}

export async function decodePlateToVin(raw: PlateDecodeRequest): Promise<HistoryPlateDecode> {
  const { plate, state } = parsePlateInput(raw);
  const status = plateStatus();
  if (!status.preferred) {
    throw new HistoryError(PLATE_DARK_NOTE, 503);
  }
  if (!hasPermissiblePurpose(raw)) {
    throw new HistoryError(
      "Check the DPPA / permissible-purpose box. A key alone does not turn the decoder on. This is not a counsel stamp.",
      403,
    );
  }

  let provider: HistoryPlateProvider = status.preferred;
  let decoded: ReturnType<typeof extractPlateVehicle>;
  try {
    decoded = provider === "carsxe" ? await decodeCarsXe(plate, state) : await decodeMarketcheck(plate, state);
  } catch (first) {
    const canFallback = provider === "carsxe" && status.marketcheck;
    if (!canFallback) throw first;
    provider = "marketcheck";
    decoded = await decodeMarketcheck(plate, state);
  }

  if (!isValidVin(decoded.vin)) {
    return {
      ok: true,
      inventedVin: false,
      provider,
      plate,
      state,
      vin: "",
      year: decoded.year,
      make: decoded.make,
      model: decoded.model,
      trim: decoded.trim,
      notice: "Plate decoder returned a name, not a usable VIN. Type the 17 from the door jamb.",
      dossier: null,
    };
  }

  const dossier = await assembleDossier(decoded.vin);
  return {
    ok: true,
    inventedVin: false,
    provider,
    plate,
    state,
    vin: decoded.vin,
    year: decoded.year || dossier.live.identity.year,
    make: decoded.make || dossier.live.identity.make,
    model: decoded.model || dossier.live.identity.model,
    trim: decoded.trim,
    notice: "Plate hit a VIN. Identity below is NHTSA vPIC, not the plate vendor’s trim sheet.",
    dossier,
  };
}
