export type JobKind = "role" | "tool" | "index";

export type JobSeverity = "urgent" | "soon" | "monitor" | "info";

export type DtcFamily = "P" | "B" | "C" | "U";

export interface JobNavItem {
  href: string;
  stamp: string;
  label: string;
  blurb: string;
  kind: JobKind;
  pipeline: number | null;
}

export interface JobDtc {
  code: string;
  title: string;
  layperson: string;
  likelySystems: string[];
  doNotThrowParts: string;
  firstLook: string;
  severity: JobSeverity;
}

export interface GenericJobDtc {
  family: DtcFamily;
  system: string;
  generic: boolean;
  subsystem: string;
  hint: string;
  doNotThrowParts: string;
}

export interface JobDtcLookup {
  code: string;
  valid: boolean;
  entry: JobDtc | null;
  generic: GenericJobDtc | null;
  error?: string;
}

export interface CheckItem {
  id: string;
  title: string;
  detail: string;
}

export interface PhotoShot {
  id: string;
  order: number;
  title: string;
  why: string;
  frame: string;
}

export interface RoTerm {
  slug: string;
  term: string;
  also: string[];
  means: string;
  sayToOwner: string;
  trap: string;
  group: "service" | "brakes" | "steering" | "trans" | "ticket" | "diag" | "hvac" | "tires";
}

export interface DiyJobCard {
  id: string;
  title: string;
  timeBand: string;
  tools: string[];
  torqueMindset: string;
  safety: string[];
  steps: CheckItem[];
}

export interface SkuLane {
  id: "oem" | "aftermarket" | "capa";
  title: string;
  useWhen: string;
  sayThis: string;
  doNotClaim: string;
}

export interface FleetLine {
  id: string;
  title: string;
  interval: string;
  upsell: string;
  askFor: string;
}
