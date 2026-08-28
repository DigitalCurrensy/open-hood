import { HOLD_DEFAULT_CENTS, HOLD_MAX_CENTS, HOLD_MIN_CENTS, HoldError } from "@/lib/trust/types";

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function parseHoldAmountCents(raw: unknown, fallback = HOLD_DEFAULT_CENTS): number {
  if (raw == null || raw === "") return fallback;
  const text = String(raw).replace(/[$,\s]/g, "");
  const dollars = Number(text);
  if (!Number.isFinite(dollars)) {
    throw new HoldError("Hold amount has to be a dollar figure.");
  }
  const cents = Math.round(dollars * 100);
  if (cents < HOLD_MIN_CENTS || cents > HOLD_MAX_CENTS) {
    throw new HoldError(
      `Hold is documented from ${formatUsdFromCents(HOLD_MIN_CENTS)} to ${formatUsdFromCents(HOLD_MAX_CENTS)}. This desk will not stamp a larger figure.`,
    );
  }
  return cents;
}
