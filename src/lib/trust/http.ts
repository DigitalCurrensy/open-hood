import { holdStatus, stampHold } from "@/lib/trust/hold";
import { parseHoldAmountCents } from "@/lib/trust/money";
import { takeHoldSlot, trustClientKey } from "@/lib/trust/rate-limit";
import { HoldError, type HoldFault } from "@/lib/trust/types";

export function handleTrustStatus(): Response {
  return jsonResponse(holdStatus());
}

export async function handleHoldSubmit(request: Request): Promise<Response> {
  const slot = takeHoldSlot(trustClientKey(request));
  if (!slot.ok) {
    const body: HoldFault = {
      ok: false,
      error: "Too many hold stamps from this line. Wait a few minutes.",
      chargesLive: false,
    };
    return jsonResponse(body, 429, { "Retry-After": String(slot.retryAfterSec) });
  }

  let raw: unknown = {};
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      raw = await request.json();
    }
  } catch {
    const body: HoldFault = { ok: false, error: "Send JSON with amountDollars, or nothing for the $50 default.", chargesLive: false };
    return jsonResponse(body, 400);
  }

  try {
    const amountDollars =
      raw && typeof raw === "object" && "amountDollars" in raw
        ? (raw as { amountDollars?: unknown }).amountDollars
        : undefined;
    const cents = parseHoldAmountCents(amountDollars);
    const ticket = await stampHold(cents);
    return jsonResponse(ticket);
  } catch (error) {
    if (error instanceof HoldError) {
      const body: HoldFault = { ok: false, error: error.message, mode: error.mode, chargesLive: false };
      return jsonResponse(body, error.status);
    }
    const body: HoldFault = {
      ok: false,
      error: "Could not stamp that hold. No money moved.",
      chargesLive: false,
    };
    return jsonResponse(body, 500);
  }
}

function jsonResponse(body: unknown, status = 200, extra?: HeadersInit): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...extra },
  });
}
