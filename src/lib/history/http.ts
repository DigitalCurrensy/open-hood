import { HISTORY_API_PATH, HISTORY_LOG_HREF, HISTORY_PHOTO_VIN_HREF, HISTORY_PLATE_API_PATH, HISTORY_ROUTE, HISTORY_STATUS_API_PATH } from "@/config/nav/history";
import { assembleDossier, requireVin } from "@/lib/history/dossier";
import { decodePlateToVin, plateStatus } from "@/lib/history/plate";
import { HISTORY_SOURCE_LEDGER } from "@/lib/history/title";
import { HistoryError, type HistoryCatalog, type HistoryErrorBody } from "@/lib/history/types";
import { titleSnapshotStatus } from "@/lib/title-snapshot";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PLATE = 8;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "local";
  return ip.slice(0, 80);
}

function takePlateSlot(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (current.count >= MAX_PLATE) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  current.count += 1;
  return { ok: true };
}

function jsonResponse(body: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
}

function fail(error: unknown): Response {
  if (error instanceof HistoryError) {
    const body: HistoryErrorBody = { ok: false, error: error.message };
    return jsonResponse(body, error.status);
  }
  const body: HistoryErrorBody = {
    ok: false,
    error: error instanceof Error ? error.message : "History lookup failed.",
  };
  return jsonResponse(body, 502);
}

export function historyCatalog(): HistoryCatalog {
  return {
    ok: true,
    route: HISTORY_ROUTE,
    api: HISTORY_API_PATH,
    plateApi: HISTORY_PLATE_API_PATH,
    statusApi: HISTORY_STATUS_API_PATH,
    logHref: HISTORY_LOG_HREF,
    photoVinHref: HISTORY_PHOTO_VIN_HREF,
    plate: plateStatus(),
    title: titleSnapshotStatus(),
    sources: HISTORY_SOURCE_LEDGER,
    note: titleSnapshotStatus().live
      ? "Live is NHTSA plus a named VinAudit or CarsXE history snapshot. Carfax, AutoCheck, NICB, and NMVTIS stay outbound. No invented accidents."
      : "Live is NHTSA plus the owner log on this device. Title bay is empty — not a Carfax file. Carfax, AutoCheck, NICB, and NMVTIS stay outbound. No invented accidents.",
  };
}

export function handleHistoryCatalog(): Response {
  return jsonResponse(historyCatalog());
}

export function handlePlateStatus(): Response {
  return jsonResponse({ ok: true, ...plateStatus() });
}

export async function handleHistoryLookup(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    let vin = url.searchParams.get("vin") ?? "";
    if (request.method === "POST") {
      const body = (await request.json().catch(() => null)) as { vin?: string } | null;
      vin = body?.vin ?? vin;
    }
    const dossier = await assembleDossier(requireVin(vin));
    return jsonResponse(dossier);
  } catch (error) {
    return fail(error);
  }
}

export async function handlePlateDecode(request: Request): Promise<Response> {
  const slot = takePlateSlot(clientKey(request));
  if (!slot.ok) {
    return jsonResponse(
      { ok: false, error: "Too many plate lookups from this line. Wait, then try again — or photo the VIN." },
      429,
      { "Retry-After": String(slot.retryAfterSec) },
    );
  }

  try {
    const url = new URL(request.url);
    let plate = url.searchParams.get("plate") ?? "";
    let state = url.searchParams.get("state") ?? "";
    let permissiblePurpose = url.searchParams.get("permissiblePurpose") === "true";
    let dppaAck = url.searchParams.get("dppaAck") === "true";
    if (request.method === "POST") {
      const body = (await request.json().catch(() => null)) as {
        plate?: string;
        state?: string;
        permissiblePurpose?: boolean;
        dppaAck?: boolean;
      } | null;
      plate = body?.plate ?? plate;
      state = body?.state ?? state;
      if (body?.permissiblePurpose === true) permissiblePurpose = true;
      if (body?.dppaAck === true) dppaAck = true;
    }
    const decoded = await decodePlateToVin({ plate, state, permissiblePurpose, dppaAck });
    return jsonResponse({ ...decoded, inventedVin: false as const });
  } catch (error) {
    return fail(error);
  }
}
