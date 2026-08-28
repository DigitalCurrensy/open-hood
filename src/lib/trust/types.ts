export const TRUST_CHECKLIST_STORAGE_KEY = "openhood.trust.checklist";
export const TRUST_FNOL_STORAGE_KEY = "openhood.trust.fnol";
export const TRUST_WORK_STORAGE_KEY = "openhood.trust.work-shots";

export const HOLD_DEFAULT_CENTS = 5_000;
export const HOLD_MIN_CENTS = 100;
export const HOLD_MAX_CENTS = 50_000;

export type StripeKeyKind = "none" | "test" | "live" | "unknown";
export type HoldMode = "demo" | "stripe-test" | "stripe-live-blocked" | "stripe-unknown-blocked";

export interface TrustCheckItem {
  id: string;
  title: string;
  detail: string;
  expert?: string;
}

export interface TrustPhotoShot {
  id: string;
  order: number;
  title: string;
  why: string;
  frame: string;
}

export interface TrustCarrier {
  id: string;
  stamp: string;
  name: string;
  href: string;
  phone: string;
  blurb: string;
}

export interface HoldStatus {
  ok: true;
  mode: HoldMode;
  keyPresent: boolean;
  keyKind: StripeKeyKind;
  documentedAmountCents: number;
  documentedAmountLabel: string;
  minAmountLabel: string;
  maxAmountLabel: string;
  chargesLive: false;
  capture: "never-here";
  notice: string;
}

export interface HoldTicket {
  ok: true;
  mode: HoldMode;
  id: string;
  amountCents: number;
  amountLabel: string;
  status: string;
  captured: false;
  chargesLive: false;
  stripeStatus?: string;
  notice: string;
}

export interface HoldFault {
  ok: false;
  error: string;
  mode?: HoldMode;
  chargesLive: false;
}

export class HoldError extends Error {
  status: number;
  mode?: HoldMode;

  constructor(message: string, status = 400, mode?: HoldMode) {
    super(message);
    this.name = "HoldError";
    this.status = status;
    this.mode = mode;
  }
}
