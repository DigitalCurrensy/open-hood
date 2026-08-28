import { normalizeDtc } from "@/lib/dtc";

export function coreObdHref(code: string): string {
  const stamp = normalizeDtc(code);
  return stamp ? `/obd?code=${encodeURIComponent(stamp)}` : "/obd";
}

export function jobsObdHref(code: string): string {
  const stamp = normalizeDtc(code);
  return stamp ? `/jobs/obd?code=${encodeURIComponent(stamp)}` : "/jobs/obd";
}

/** Lands on quote defense with the DTC in the query. Paste still wins if the desk ignores the param. */
export function quoteFromDtcHref(code: string): string {
  const stamp = normalizeDtc(code);
  return stamp ? `/quote?code=${encodeURIComponent(stamp)}` : "/quote";
}
