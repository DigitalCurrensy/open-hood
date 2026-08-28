import { formatUsdFromCents } from "@/lib/trust/money";
import { stripeKeyKind } from "@/lib/trust/hold";
import type { StripeKeyKind } from "@/lib/trust/types";

export const PACKET_FEE_CENTS = 300;
export const PACKET_PRODUCT_NAME = "Print packet / hold this bay";
export const PACKET_CHECKOUT_PATH = "/api/stripe/packet";

export type StripeProduct = "none" | "packet";

export function packetPriceId(): string {
  const raw = process.env.STRIPE_PACKET_PRICE_ID?.trim() ?? "";
  return raw.startsWith("price_") ? raw : "";
}

export function hasPacketProduct(): boolean {
  return Boolean(packetPriceId());
}

export function packetCheckoutAllowed(kind: StripeKeyKind = stripeKeyKind()): boolean {
  if (kind === "test") return true;
  if (kind === "live") return hasPacketProduct();
  return false;
}

export function packetProduct(kind: StripeKeyKind = stripeKeyKind()): StripeProduct {
  return packetCheckoutAllowed(kind) ? "packet" : "none";
}

export function packetAmountLabel(cents = PACKET_FEE_CENTS): string {
  return formatUsdFromCents(cents);
}

export function stripeSecret(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}

export function packetNotice(kind: StripeKeyKind = stripeKeyKind()): string {
  if (kind === "test") {
    return `${PACKET_PRODUCT_NAME} is a ${packetAmountLabel()} test Checkout. Founder can finish with Stripe test card 4242. Not captured as escrow. Not a shop cut. Not a marketplace.`;
  }
  if (kind === "live" && hasPacketProduct()) {
    return `Live key plus STRIPE_PACKET_PRICE_ID. Packet fee only. Escrow, shop cuts, and marketplace stay refused.`;
  }
  if (kind === "live") {
    return "Live Stripe key detected. product:none. No packet Price ID, so no Checkout. Escrow refused.";
  }
  if (kind === "unknown") {
    return "Stripe key is set but it is not sk_test_ or sk_live_. Packet fee stays dark. Escrow refused.";
  }
  return "No Stripe key. Optional packet fee stays dark. A sk_test_ key opens test Checkout.";
}

export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = (request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")).split(",")[0]?.trim();
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host)
    .split(",")[0]
    ?.trim();
  if (!proto || !host) return url.origin;
  return `${proto}://${host}`;
}

export function safeReturnPath(value: unknown): string {
  if (typeof value !== "string") return "/integrations";
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return "/integrations";
  return path;
}

interface StripeCheckoutPayload {
  id?: string;
  url?: string | null;
  payment_status?: string;
  status?: string;
  amount_total?: number;
  error?: { message?: string };
}

export async function createPacketCheckout(options: {
  origin: string;
  returnPath: string;
}): Promise<{ id: string; url: string; kind: StripeKeyKind; product: StripeProduct }> {
  const kind = stripeKeyKind();
  if (!packetCheckoutAllowed(kind)) {
    throw new PacketFeeError(
      kind === "live"
        ? "Live key has no packet Price ID. Escrow is refused. Add STRIPE_PACKET_PRICE_ID or use sk_test_."
        : "No Stripe test key. Packet fee stays dark.",
      kind === "none" ? 404 : 403,
    );
  }

  const secret = stripeSecret();
  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("success_url", `${options.origin}${options.returnPath}?packet=paid&session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${options.origin}${options.returnPath}?packet=cancel`);
  body.set("client_reference_id", "packet-fee");
  body.set("metadata[kind]", "packet-fee");
  body.set("metadata[escrow]", "false");
  body.set("metadata[shop_cut]", "false");
  body.set("metadata[marketplace]", "false");
  body.set("payment_intent_data[description]", "Open Hood print packet / hold this bay. Not escrow. Not a shop cut.");
  body.set("payment_intent_data[metadata][kind]", "packet-fee");
  body.set("payment_intent_data[metadata][escrow]", "false");
  body.append("payment_method_types[]", "card");

  const livePrice = packetPriceId();
  if (kind === "live" && livePrice) {
    body.set("line_items[0][price]", livePrice);
    body.set("line_items[0][quantity]", "1");
  } else {
    body.set("line_items[0][quantity]", "1");
    body.set("line_items[0][price_data][currency]", "usd");
    body.set("line_items[0][price_data][unit_amount]", String(PACKET_FEE_CENTS));
    body.set("line_items[0][price_data][product_data][name]", PACKET_PRODUCT_NAME);
    body.set(
      "line_items[0][price_data][product_data][description]",
      "Optional bay fee. Not escrow. Not a shop deposit. Not a marketplace cut.",
    );
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString().replace(/%7BCHECKOUT_SESSION_ID%7D/g, "{CHECKOUT_SESSION_ID}"),
    cache: "no-store",
  });
  const payload = (await response.json()) as StripeCheckoutPayload;
  if (!response.ok || !payload.id || !payload.url) {
    throw new PacketFeeError(payload.error?.message || "Stripe did not open that packet Checkout.", 502);
  }
  return { id: payload.id, url: payload.url, kind, product: "packet" };
}

export async function retrievePacketSession(sessionId: string): Promise<{
  id: string;
  paymentStatus: string;
  status: string;
  amountCents: number | null;
}> {
  const secret = stripeSecret();
  if (!secret) throw new PacketFeeError("No Stripe key.", 404);
  const id = sessionId.trim();
  if (!id.startsWith("cs_")) throw new PacketFeeError("That is not a Checkout session.", 400);

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const payload = (await response.json()) as StripeCheckoutPayload;
  if (!response.ok || !payload.id) {
    throw new PacketFeeError(payload.error?.message || "Stripe did not find that session.", 502);
  }
  return {
    id: payload.id,
    paymentStatus: payload.payment_status ?? "unpaid",
    status: payload.status ?? "open",
    amountCents: typeof payload.amount_total === "number" ? payload.amount_total : null,
  };
}

export class PacketFeeError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PacketFeeError";
    this.status = status;
  }
}
