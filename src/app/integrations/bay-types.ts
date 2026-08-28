export type PipeState = "live" | "outbound" | "dark" | "refused";

export type ProbeKind = "skip" | "ok" | "fail" | "none";

export type FounderLane = "wired" | "paper" | "site" | "stripe";

export interface PipeRow {
  id: string;
  name: string;
  stamp: string;
  lane: "live" | "env" | "catalog";
  family: string;
  state: PipeState;
  configured: boolean | null;
  probed: ProbeKind | null;
  env: string | null;
  unlocks: string;
  href: string;
  paper: boolean;
  adapter: string | null;
}

export interface ProbeRow {
  id: string;
  label: string;
  ok: boolean;
  status: number | null;
  ms: number;
  note: string;
}

export interface KeyRow {
  env: string;
  configured: boolean;
  keyPresent: boolean;
  probed: ProbeKind;
  wired: boolean;
  refused: boolean;
  label: string;
  usedFor: string;
  unlocks: string;
  connectUrl: string;
  openWhenReady: string;
}

export interface StripeRow {
  kind: "none" | "test" | "live" | "unknown";
  configured: boolean;
  refused: boolean;
  liveKeyDetected: boolean;
  product: "none" | "packet";
  checkout: boolean;
  escrow: false;
  shopCuts: false;
  marketplace: false;
  notice: string;
  unlocks: string;
  desk: "/integrations";
}

export interface LicensedCatalogRow {
  skus: [];
  hours: [];
  tecdoc: false;
  motor: false;
  chrome: false;
  partstech: false;
  note: string;
}

export interface FounderRow {
  env: string;
  unlocks: string;
  lane: FounderLane;
  keyPresent: boolean;
  configured: boolean;
  weekend: boolean;
}

export interface BayStatus {
  generatedAt: string;
  count: number;
  pipes: PipeRow[];
  keys: KeyRow[];
  paper: KeyRow[];
  founder: FounderRow[];
  probes: ProbeRow[];
  stripe: StripeRow;
  licensedCatalog: LicensedCatalogRow;
  liveIds: string[];
  envIds: string[];
  catalogIds: string[];
  weekend: string[];
}
