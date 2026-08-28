export type FinderLane = "diagnose" | "replace" | "inspect";
export type FinderSplit = "diy" | "shop" | "either";
export type FinderSessionField = "engine" | "drive";

export interface FinderYmm {
  year: string;
  make: string;
  model: string;
  engine: string;
  drive: string;
}

export interface FinderAisleQuestion {
  id: string;
  ask: string;
  why: string;
  session?: FinderSessionField;
}

export interface FinderPart {
  id: string;
  label: string;
  query: string;
  aisle: string;
  bin: string;
  order: number;
  hold: boolean;
  note: string;
}

export interface FinderDiy {
  can: boolean;
  why: string;
  steps: string[];
  tools: string[];
}

export interface FinderShop {
  why: string;
  say: string[];
}

export interface FinderJob {
  id: string;
  slug: string;
  stamp: string;
  title: string;
  kicker: string;
  lane: FinderLane;
  split: FinderSplit;
  codes: string[];
  symptoms: string[];
  aliases: string[];
  plainEnglish: string;
  doNotThrow: string;
  minutes: string;
  diy: FinderDiy;
  shop: FinderShop;
  aisleQuestions: FinderAisleQuestion[];
  parts: FinderPart[];
  related: string[];
}

export interface FinderQuery {
  code?: string;
  q?: string;
  symptom?: string;
  job?: string;
}

export interface FinderHit {
  job: FinderJob;
  score: number;
  reason: string;
}

export interface FinderRetailerLink {
  id: string;
  name: string;
  href: string;
  note: string;
}

export interface FinderPartTicket {
  part: FinderPart;
  query: string;
  retailers: FinderRetailerLink[];
}

export interface FinderAisleAnswer {
  question: FinderAisleQuestion;
  answer: string;
  source: "session" | "ask";
}

export interface FinderCatalogHook {
  id: string;
  name: string;
  env: string;
  configured: boolean;
  wired: boolean;
  note: string;
}

export interface FinderFilters {
  code?: string;
  q?: string;
  symptom?: string;
  job?: string;
  ymm: FinderYmm;
}
