import { formatUsdFromCents } from "@/lib/trust/money";
import {
  HOLD_DEFAULT_CENTS,
  HOLD_MAX_CENTS,
  HOLD_MIN_CENTS,
  HoldError,
  type HoldMode,
  type HoldStatus,
  type HoldTicket,
  type StripeKeyKind,
} from "@/lib/trust/types";

function readSecret(): string {
  return process.env.STRIPE_SECRET_KEY?.trim() ?? "";
}

export function stripeKeyKind(secret = readSecret()): StripeKeyKind {
  if (!secret) return "none";
  if (secret.includes("_live_")) return "live";
  if (secret.includes("_test_")) return "test";
  return "unknown";
}

export function holdModeFor(kind: StripeKeyKind): HoldMode {
  if (kind === "test") return "stripe-test";
  if (kind === "live") return "stripe-live-blocked";
  if (kind === "unknown") return "stripe-unknown-blocked";
  return "demo";
}

function statusNotice(mode: HoldMode): string {
  switch (mode) {
    case "stripe-test":
      return "Stripe test key is on this bay. Stamp hold creates a PaymentIntent for the dollars you type. It is not captured. No card is taken on this page. Test mode — not a live charge.";
    case "stripe-live-blocked":
      return "A live Stripe key is on this bay. This desk will not create a live PaymentIntent. Use a sk_test_ key, or stamp a DEMO hold. No money moved.";
    case "stripe-unknown-blocked":
      return "A Stripe key is set but it is not a sk_test_ key. This desk will not send it. Stamp a DEMO hold. No money moved.";
    default:
      return "No Stripe key. This hold is a DEMO stamp — paper only. No card, no PaymentIntent, no shop deposit.";
  }
}

export function holdStatus(): HoldStatus {
  const kind = stripeKeyKind();
  const mode = holdModeFor(kind);
  return {
    ok: true,
    mode,
    keyPresent: kind !== "none",
    keyKind: kind,
    documentedAmountCents: HOLD_DEFAULT_CENTS,
    documentedAmountLabel: formatUsdFromCents(HOLD_DEFAULT_CENTS),
    minAmountLabel: formatUsdFromCents(HOLD_MIN_CENTS),
    maxAmountLabel: formatUsdFromCents(HOLD_MAX_CENTS),
    chargesLive: false,
    capture: "never-here",
    notice: statusNotice(mode),
  };
}

export function canCreateStripeIntent(kind: StripeKeyKind = stripeKeyKind()): boolean {
  return kind === "test";
}

interface StripeIntentPayload {
  id?: string;
  status?: string;
  amount?: number;
  error?: { message?: string };
}

export async function createStripeTestIntent(amountCents: number, secret: string): Promise<{
  id: string;
  status: string;
  amount: number;
}> {
  const body = new URLSearchParams();
  body.set("amount", String(amountCents));
  body.set("currency", "usd");
  body.set("capture_method", "manual");
  body.set("confirm", "false");
  body.append("payment_method_types[]", "card");
  body.set(
    "description",
    "Open Hood documented hold (Stripe test). Not a shop payment. Not captured on this desk.",
  );
  body.set("metadata[desk]", "trust");
  body.set("metadata[kind]", "documented-hold");
  body.set("metadata[live_charge]", "false");

  const response = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const payload = (await response.json()) as StripeIntentPayload;
  if (!response.ok || !payload.id) {
    throw new HoldError(payload.error?.message || "Stripe did not stamp that test intent.", 502, "stripe-test");
  }

  return {
    id: payload.id,
    status: payload.status ?? "requires_payment_method",
    amount: payload.amount ?? amountCents,
  };
}

export async function stampHold(amountCents: number): Promise<HoldTicket> {
  const status = holdStatus();
  const amountLabel = formatUsdFromCents(amountCents);

  if (status.mode === "stripe-live-blocked" || status.mode === "stripe-unknown-blocked") {
    return demoTicket(amountCents, amountLabel, status.mode, blockedNotice(status.mode));
  }

  if (status.mode === "stripe-test") {
    const secret = readSecret();
    const intent = await createStripeTestIntent(amountCents, secret);
    return {
      ok: true,
      mode: "stripe-test",
      id: intent.id,
      amountCents: intent.amount,
      amountLabel: formatUsdFromCents(intent.amount),
      status: intent.status,
      captured: false,
      chargesLive: false,
      stripeStatus: intent.status,
      notice:
        "Stripe test mode. PaymentIntent created for the documented amount. Not captured. No card was taken on this page. This is not a shop deposit and not a live charge.",
    };
  }

  return demoTicket(
    amountCents,
    amountLabel,
    "demo",
    "DEMO hold stamped. No card. No Stripe. This is a paper stand-in — not escrow, not a shop payment.",
  );
}

function blockedNotice(mode: HoldMode): string {
  if (mode === "stripe-live-blocked") {
    return "Live Stripe key refused. DEMO stamp only. No PaymentIntent. No live charge.";
  }
  return "Unrecognized Stripe key refused. DEMO stamp only. No PaymentIntent. No money moved.";
}

function demoTicket(amountCents: number, amountLabel: string, mode: HoldMode, notice: string): HoldTicket {
  return {
    ok: true,
    mode,
    id: `hold_demo_${Date.now().toString(36)}`,
    amountCents,
    amountLabel,
    status: "demo",
    captured: false,
    chargesLive: false,
    notice,
  };
}
