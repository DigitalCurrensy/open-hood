import {
  buildServiceLogExport,
  serviceLogCatalog,
  serviceLogFilename,
} from "@/lib/service-log/export";
import { ServiceLogError, requireEntries } from "@/lib/service-log/parse";

export async function handleServiceLogCatalog(): Promise<Response> {
  return jsonResponse(serviceLogCatalog());
}

export async function handleServiceLogExport(request: Request): Promise<Response> {
  try {
    const entries = requireEntries(await readBody(request));
    const packet = buildServiceLogExport(entries);
    const download = new URL(request.url).searchParams.get("download");
    if (download === "1" || download === "true") {
      return new Response(`${JSON.stringify(packet, null, 2)}\n`, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="${serviceLogFilename(packet.exportedAt)}"`,
          "Cache-Control": "no-store",
        },
      });
    }
    return jsonResponse(packet);
  } catch (error) {
    return logErrorResponse(error);
  }
}

async function readBody(request: Request): Promise<unknown> {
  const text = await request.text();
  if (!text.trim()) {
    throw new ServiceLogError("Send JSON: an entry, an entries array, or an export object.");
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ServiceLogError("Send JSON: an entry, an entries array, or an export object.");
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(`${JSON.stringify(body)}\n`, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function logErrorResponse(error: unknown): Response {
  const message = error instanceof Error ? error.message : "The notebook could not read that JSON.";
  const status = error instanceof ServiceLogError ? error.status : 400;
  return jsonResponse({ error: message }, status);
}
