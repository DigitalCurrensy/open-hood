import { NextResponse } from "next/server";
import { decodePlateToVin, hasPermissiblePurpose, plateStatus } from "@/lib/history/plate";
import { HistoryError, PLATE_DARK_NOTE, PLATE_VENDOR_KEY_NAMES } from "@/lib/history/types";

export const dynamic = "force-dynamic";

function darkBody() {
  const status = plateStatus();
  return {
    configured: false,
    connected: false,
    probed: "none",
    inventedVin: false,
    carsxe: status.carsxe,
    marketcheck: status.marketcheck,
    keyNames: PLATE_VENDOR_KEY_NAMES,
    vin: null,
    year: null,
    make: null,
    model: null,
    shops: [],
    prices: [],
    unlocks:
      "CARSXE_API_KEY or MARKETCHECK_API_KEY turns plate-to-VIN on after the DPPA box. Off → the plate stays a note. We do not invent a VIN, a shop, or a price.",
    note: status.note || PLATE_DARK_NOTE,
    desk: "/history",
  };
}

export function GET() {
  const status = plateStatus();
  if (!status.live) return NextResponse.json(darkBody());
  return NextResponse.json({
    configured: true,
    connected: true,
    probed: "skip",
    inventedVin: false,
    carsxe: status.carsxe,
    marketcheck: status.marketcheck,
    preferred: status.preferred,
    keyNames: PLATE_VENDOR_KEY_NAMES,
    vin: null,
    unlocks: "POST plate + US state + DPPA acknowledgment. Identity after the hit is still NHTSA vPIC.",
    note: status.note,
    desk: "/history",
  });
}

export async function POST(request: Request) {
  const status = plateStatus();
  if (!status.live) {
    return NextResponse.json(darkBody(), { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send JSON: plate, state, permissiblePurpose.", inventedVin: false, vin: null },
      { status: 400 },
    );
  }

  const body =
    raw && typeof raw === "object"
      ? (raw as { plate?: string; state?: string; permissiblePurpose?: boolean; dppaAck?: boolean })
      : {};

  if (!hasPermissiblePurpose(body)) {
    return NextResponse.json(
      {
        configured: true,
        connected: true,
        probed: "skip",
        inventedVin: false,
        vin: null,
        shops: [],
        prices: [],
        error:
          "Check the DPPA / permissible-purpose box. A key alone does not turn the decoder on. This is not a counsel stamp.",
        note: status.note,
      },
      { status: 403 },
    );
  }

  try {
    const decoded = await decodePlateToVin(body);
    const vin = decoded.vin || null;
    return NextResponse.json({
      configured: true,
      connected: true,
      probed: "skip",
      inventedVin: false,
      provider: decoded.provider,
      plate: decoded.plate,
      state: decoded.state,
      vin,
      year: decoded.year || null,
      make: decoded.make || null,
      model: decoded.model || null,
      trim: decoded.trim || null,
      notice: decoded.notice,
      shops: [],
      prices: [],
    });
  } catch (error) {
    const statusCode = error instanceof HistoryError ? error.status : 502;
    return NextResponse.json(
      {
        configured: true,
        connected: true,
        probed: "skip",
        inventedVin: false,
        vin: null,
        shops: [],
        prices: [],
        error: error instanceof Error ? error.message : "Plate decode failed.",
      },
      { status: statusCode },
    );
  }
}
