export type PlaybookAudience = "owner" | "buyer" | "ev" | "claim" | "shop";

export interface PlaybookLink {
  href: string;
  stamp: string;
  label: string;
  why: string;
}

export interface DummyStep {
  id: string;
  title: string;
  do: string;
  say?: string;
}

export interface GeniusNote {
  id: string;
  label: string;
  meaning: string;
  unit?: string;
}

export interface Playbook {
  id: string;
  slug: string;
  stamp: string;
  title: string;
  kicker: string;
  plainEnglish: string;
  minutes: number;
  audience: PlaybookAudience;
  scenario: string;
  dummySteps: DummyStep[];
  geniusNotes: GeniusNote[];
  script: string[];
  dont: string[];
  links: PlaybookLink[];
  relatedGuides: string[];
  relatedJobs: string[];
  relatedTsb: string[];
}

export type TsbKind = "recall" | "complaint-pattern" | "campaign";

export interface TsbPattern {
  id: string;
  stamp: string;
  symptom: string;
  makes: string[];
  models: string[];
  years: string;
  pattern: string;
  notATsb: string;
  dummyMove: string;
  geniusNote: string;
  nhtsaKind: TsbKind;
  saferCarUrl: string;
  vinLookupUrl: string;
  relatedPlaybooks: string[];
}

export interface ExpertNavItem {
  href: string;
  stamp: string;
  label: string;
  blurb: string;
  kind: "index" | "tool" | "playbook";
}

export interface SaferCarLookup {
  year: string;
  make: string;
  model: string;
  recallCount: number;
  recalls: Array<{
    campaignNumber: string;
    component: string;
    summary: string;
    consequence: string;
    remedy: string;
  }>;
  complaints: {
    count: number;
    crash: number;
    fire: number;
    injured: number;
    deaths: number;
    topComponents: string[];
  };
  saferCarUrl: string;
  vinLookupUrl: string;
  disclaimer: string;
}

export interface ExpertFilters {
  q?: string;
  audience?: PlaybookAudience;
  make?: string;
  symptom?: string;
}
