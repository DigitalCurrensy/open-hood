import { handlePlateDecode, hasPermissiblePurpose, plateStatus, PLATE_DARK_NOTE } from "@/lib/history";
import { inspectPlateFormat, PLATE_FORMAT_HONESTY } from "@/lib/plate-format";

export const dynamic = "force-dynamic";

function readPlateFields(request: Request, body: { plate?: string; state?: string } | null) {
  const url = new URL(request.url);
  const plate = (body?.plate ?? url.searchParams.get("plate") ?? "").trim().toUpperCase();
  const state = (body?.state ?? url.searchParams.get("state") ?? "").trim().toUpperCase();
  return { plate, state, format: inspectPlateFormat({ plate, state }) };
}

function honesty() {
  const status = plateStatus();
  return {
    inventedVin: false,
    vin: "",
    formatCheck: "key-free" as const,
    formatNote: PLATE_FORMAT_HONESTY,
    ...status,
    connected: status.live,
  };
}

export function GET(request: Request) {
  const { plate, state, format } = readPlateFields(request, null);
  const body = honesty();
  return Response.json(
    {
      ok: true,
      ...body,
      plate,
      state,
      format,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const status = plateStatus();
  const keyOn = Boolean(status.preferred);
  let parsed: {
    plate?: string;
    state?: string;
    permissiblePurpose?: boolean;
    dppaAck?: boolean;
  } | null = null;
  try {
    parsed = (await request.clone().json().catch(() => null)) as typeof parsed;
  } catch {
    parsed = null;
  }
  const { plate, state, format } = readPlateFields(request, parsed);

  if (!keyOn) {
    return Response.json(
      {
        ok: false,
        connected: false,
        inventedVin: false,
        vin: "",
        plate,
        state,
        format,
        formatCheck: "key-free",
        error: format.stamp
          ? `${format.stamp.replace(/\.$/, "")}. ${PLATE_DARK_NOTE}`
          : PLATE_DARK_NOTE,
        note: status.note,
        photoVinHref: status.photoVinHref,
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (!hasPermissiblePurpose(parsed)) {
    return Response.json(
      {
        ok: false,
        connected: false,
        inventedVin: false,
        vin: "",
        plate,
        state,
        format,
        formatCheck: "key-free",
        error:
          "Check the DPPA / permissible-purpose box. A key alone does not turn the decoder on. This is not a counsel stamp.",
        note: status.note,
        photoVinHref: status.photoVinHref,
      },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const inner = await handlePlateDecode(request);
  const payload = (await inner.json()) as {
    ok?: boolean;
    vin?: string;
    inventedVin?: boolean;
    error?: string;
    notice?: string;
  };
  const vendorVin = typeof payload.vin === "string" ? payload.vin : "";
  const hit = inner.ok && Boolean(vendorVin) && payload.inventedVin !== true;

  if (hit) {
    return Response.json(
      {
        ...payload,
        connected: true,
        inventedVin: false,
        vin: vendorVin,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const error =
    (typeof payload.error === "string" && payload.error) ||
    (typeof payload.notice === "string" && payload.notice) ||
    "Plate decoder missed. Type the 17 from the door jamb.";

  return Response.json(
    {
      ...payload,
      ok: false,
      connected: true,
      inventedVin: false,
      vin: "",
      error,
    },
    { status: inner.status === 200 ? 404 : inner.status, headers: { "Cache-Control": "no-store" } },
  );
}
