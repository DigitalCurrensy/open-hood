import {
  REPORT_PRINT_PATH,
  buildReportPacket,
  reportDownloadFilename,
  type ReportPacketInput,
} from "@/lib/report/packet";
import { renderReportHtml } from "@/lib/report/html";

export class ReportRequestError extends Error {
  status = 400;
}

export async function readReportInput(request: Request): Promise<ReportPacketInput> {
  const url = new URL(request.url);
  const fromQuery = inputFromSearchParams(url.searchParams);

  if (request.method === "GET" || request.method === "HEAD") {
    return fromQuery;
  }

  const text = await request.text();
  if (!text.trim()) return fromQuery;

  try {
    return mergeInput(fromQuery, inputFromUnknown(JSON.parse(text) as unknown));
  } catch {
    throw new ReportRequestError("Send JSON: a packet or loose findings fields.");
  }
}

export async function handleReportBuild(request: Request): Promise<Response> {
  try {
    const packet = buildReportPacket(await readReportInput(request));
    return jsonResponse({ packet, printPath: REPORT_PRINT_PATH });
  } catch (error) {
    return reportErrorResponse(error, "json");
  }
}

export async function handleReportPrint(request: Request): Promise<Response> {
  try {
    const html = renderReportHtml(buildReportPacket(await readReportInput(request)));
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return reportErrorResponse(error, "html");
  }
}

export async function handleReportDownload(request: Request): Promise<Response> {
  try {
    const packet = buildReportPacket(await readReportInput(request));
    const filename = reportDownloadFilename(packet);
    return new Response(`${JSON.stringify(packet, null, 2)}\n`, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return reportErrorResponse(error, "json");
  }
}

export function inputFromUnknown(raw: unknown): ReportPacketInput {
  if (!isRecord(raw)) return {};

  const packet = isRecord(raw.packet) ? (raw.packet as ReportPacketInput["packet"]) : undefined;
  const codes = asList(raw.codes ?? raw.code);
  const ticks = asStringList(raw.playbookTicks ?? raw.ticks);
  const symptoms = asList(raw.symptoms);
  const findings = asList(raw.findings);
  const serviceLog = asServiceLog(raw.serviceLog);
  const nextDesks = asDeskList(raw.nextDesks);

  return {
    packet,
    generatedAt: asString(raw.generatedAt),
    mode: asString(raw.mode),
    vehicle: isRecord(raw.vehicle) ? (raw.vehicle as ReportPacketInput["vehicle"]) : undefined,
    specs: isRecord(raw.specs) ? (raw.specs as ReportPacketInput["specs"]) : undefined,
    fluids: isRecord(raw.fluids) ? (raw.fluids as ReportPacketInput["fluids"]) : undefined,
    quote: isRecord(raw.quote) ? (raw.quote as ReportPacketInput["quote"]) : undefined,
    symptoms,
    findings,
    codes,
    playbookTicks: ticks,
    serviceLog,
    nextDesks,
  };
}

export function inputFromSearchParams(params: URLSearchParams): ReportPacketInput {
  const packetRaw = params.get("packet");
  let packet: ReportPacketInput["packet"];
  if (packetRaw) {
    try {
      const parsed = JSON.parse(packetRaw) as unknown;
      if (isRecord(parsed)) packet = parsed as ReportPacketInput["packet"];
    } catch {
      throw new ReportRequestError("The packet query must be JSON.");
    }
  }

  const codes = splitParam(params, "codes", "code");
  const ticks = splitParam(params, "playbookTicks", "ticks");
  const desks = splitParam(params, "nextDesks", "desk");

  const vehicle = omitUndefined({
    vin: emptyToUndef(params.get("vin")),
    year: emptyToUndef(params.get("year")),
    make: emptyToUndef(params.get("make")),
    model: emptyToUndef(params.get("model")),
    trim: emptyToUndef(params.get("trim")),
    engine: emptyToUndef(params.get("engine")),
    plate: emptyToUndef(params.get("plate")),
    state: emptyToUndef(params.get("state")),
    mileage: emptyToUndef(params.get("mileage")),
    concern: emptyToUndef(params.get("concern")),
  });

  const fluids = omitUndefined({
    viscosity: emptyToUndef(params.get("viscosity")),
    capacity: emptyToUndef(params.get("capacity")),
    tirePsiFront: emptyToUndef(params.get("tirePsiFront")),
    tirePsiRear: emptyToUndef(params.get("tirePsiRear")),
    oilFilterSku: emptyToUndef(params.get("oilFilterSku")),
    airFilterSku: emptyToUndef(params.get("airFilterSku")),
    cabinFilterSku: emptyToUndef(params.get("cabinFilterSku")),
  });

  return {
    packet,
    generatedAt: emptyToUndef(params.get("generatedAt")),
    mode: emptyToUndef(params.get("mode")),
    vehicle: Object.keys(vehicle).length ? vehicle : undefined,
    fluids: Object.keys(fluids).length ? fluids : undefined,
    codes: codes.length ? codes : undefined,
    playbookTicks: ticks.length ? ticks : undefined,
    nextDesks: desks.length ? desks : undefined,
  };
}

function mergeInput(base: ReportPacketInput, overlay: ReportPacketInput): ReportPacketInput {
  return {
    packet: overlay.packet ?? base.packet,
    generatedAt: overlay.generatedAt ?? base.generatedAt,
    mode: overlay.mode ?? base.mode,
    vehicle: overlay.vehicle ?? base.vehicle,
    specs: overlay.specs ?? base.specs,
    fluids: overlay.fluids ?? base.fluids,
    quote: overlay.quote ?? base.quote,
    symptoms: overlay.symptoms ?? base.symptoms,
    findings: overlay.findings ?? base.findings,
    codes: overlay.codes ?? base.codes,
    playbookTicks: overlay.playbookTicks ?? base.playbookTicks,
    serviceLog: overlay.serviceLog ?? base.serviceLog,
    nextDesks: overlay.nextDesks ?? base.nextDesks,
  };
}

function reportErrorResponse(error: unknown, kind: "json" | "html"): Response {
  const message = error instanceof ReportRequestError ? error.message : "Could not build the findings packet.";
  const status = error instanceof ReportRequestError ? error.status : 400;
  if (kind === "html") {
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Findings</title></head><body style="background:#0c1210;color:#d7efe0;font-family:Barlow,sans-serif;padding:2rem"><p>${escapeText(message)}</p></body></html>`;
    return new Response(html, {
      status,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return jsonResponse({ error: message }, status);
}

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function asList(value: unknown): ReportPacketInput["codes"] {
  if (typeof value === "string") return splitCsv(value);
  if (!Array.isArray(value)) return undefined;
  return value as ReportPacketInput["codes"];
}

function asStringList(value: unknown): string[] | undefined {
  if (typeof value === "string") return splitCsv(value);
  if (!Array.isArray(value)) return undefined;
  return value.filter((row): row is string => typeof row === "string");
}

function asDeskList(value: unknown): ReportPacketInput["nextDesks"] {
  if (typeof value === "string") return splitCsv(value);
  if (!Array.isArray(value)) return undefined;
  return value as ReportPacketInput["nextDesks"];
}

function asServiceLog(value: unknown): ReportPacketInput["serviceLog"] {
  if (!Array.isArray(value)) return undefined;
  return value as ReportPacketInput["serviceLog"];
}

function splitParam(params: URLSearchParams, key: string, alt: string): string[] {
  const rows = [...params.getAll(key), ...params.getAll(alt)].flatMap(splitCsv);
  return rows;
}

function splitCsv(value: string): string[] {
  return value
    .split(/[|,]/)
    .map((row) => row.trim())
    .filter(Boolean);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function emptyToUndef(value: string | null): string | undefined {
  const next = value?.trim();
  return next ? next : undefined;
}

function omitUndefined<T extends Record<string, string | undefined>>(row: T): Partial<T> {
  const next: Partial<T> = {};
  for (const [key, value] of Object.entries(row)) {
    if (value) next[key as keyof T] = value as T[keyof T];
  }
  return next;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function escapeText(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
