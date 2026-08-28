import { NextResponse } from "next/server";
import { stripeRow } from "@/app/api/integrations/_lib/keys";
import { PACKET_CHECKOUT_PATH, PACKET_FEE_CENTS, packetAmountLabel, packetNotice } from "@/lib/stripe/packet";

export const dynamic = "force-dynamic";

export function GET() {
  const stripe = stripeRow();
  return NextResponse.json({
    configured: stripe.configured,
    connected: stripe.configured,
    refused: stripe.refused,
    liveKeyDetected: stripe.liveKeyDetected,
    kind: stripe.kind,
    product: stripe.product,
    checkout: stripe.checkout,
    escrow: false,
    shopCuts: false,
    marketplace: false,
    chargesLive: stripe.kind === "live" && stripe.checkout,
    capture: stripe.checkout ? "checkout" : stripe.kind === "test" ? "never-here" : "refused",
    amountCents: PACKET_FEE_CENTS,
    amountLabel: packetAmountLabel(),
    notice: packetNotice(stripe.kind),
    unlocks: stripe.unlocks,
    checkoutPath: PACKET_CHECKOUT_PATH,
    desk: stripe.desk,
    holdDesk: "/trust",
  });
}
