import { NextResponse } from "next/server";
import { stripeRow } from "@/app/api/integrations/_lib/keys";
import {
  PACKET_CHECKOUT_PATH,
  PACKET_FEE_CENTS,
  PACKET_PRODUCT_NAME,
  PacketFeeError,
  createPacketCheckout,
  packetAmountLabel,
  packetNotice,
  requestOrigin,
  retrievePacketSession,
  safeReturnPath,
} from "@/lib/stripe/packet";

export const dynamic = "force-dynamic";

function honesty() {
  const stripe = stripeRow();
  return {
    configured: stripe.configured,
    connected: stripe.configured,
    kind: stripe.kind,
    product: stripe.product,
    checkout: stripe.checkout,
    escrow: false,
    shopCuts: false,
    marketplace: false,
    refused: stripe.refused,
    liveKeyDetected: stripe.liveKeyDetected,
    amountCents: PACKET_FEE_CENTS,
    amountLabel: packetAmountLabel(),
    name: PACKET_PRODUCT_NAME,
    notice: packetNotice(stripe.kind),
    checkoutPath: PACKET_CHECKOUT_PATH,
    desk: "/integrations",
    holdDesk: "/trust",
  };
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("session_id")?.trim() ?? "";
  if (!sessionId) {
    return NextResponse.json(honesty());
  }
  try {
    const session = await retrievePacketSession(sessionId);
    return NextResponse.json({
      ...honesty(),
      session,
    });
  } catch (error) {
    if (error instanceof PacketFeeError) {
      return NextResponse.json({ ...honesty(), error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ...honesty(), error: "Stripe did not answer." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const stripe = stripeRow();
  if (!stripe.checkout) {
    return NextResponse.json(
      {
        ...honesty(),
        error: stripe.notice,
      },
      { status: stripe.kind === "none" ? 404 : 403 },
    );
  }

  let returnPath = "/integrations";
  try {
    if (request.headers.get("content-type")?.includes("application/json")) {
      const raw = (await request.json()) as { returnPath?: unknown };
      returnPath = safeReturnPath(raw.returnPath);
    }
  } catch {
    returnPath = "/integrations";
  }

  try {
    const session = await createPacketCheckout({
      origin: requestOrigin(request),
      returnPath,
    });
    return NextResponse.json({
      ...honesty(),
      ok: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof PacketFeeError) {
      return NextResponse.json({ ...honesty(), error: error.message }, { status: error.status });
    }
    return NextResponse.json({ ...honesty(), error: "Could not open Stripe Checkout." }, { status: 502 });
  }
}
