export const VALUE_CONDITIONS = [
  { id: "excellent", label: "Excellent", hint: "Retail-clean, no stories", factor: 1.12 },
  { id: "good", label: "Good", hint: "Driven, honest wear", factor: 1 },
  { id: "fair", label: "Fair", hint: "Needs work you can see", factor: 0.82 },
  { id: "rough", label: "Rough", hint: "Project or parts", factor: 0.62 },
] as const;

export type ValueConditionId = (typeof VALUE_CONDITIONS)[number]["id"];

export interface ValueInput {
  year: number;
  make: string;
  model: string;
  mileage: number;
  condition: ValueConditionId;
  knownPrice: number | null;
  asOfYear: number;
}

export interface ValueStep {
  label: string;
  value: string;
}

export interface ValueIllustration {
  year: number;
  make: string;
  model: string;
  mileage: number;
  condition: ValueConditionId;
  asOfYear: number;
  ageYears: number;
  expectedMiles: number;
  ageKeep: number;
  mileageFactor: number;
  conditionFactor: number;
  mid: number;
  low: number;
  high: number;
  midPct: string;
  lowPct: string;
  highPct: string;
  knownPrice: number | null;
  dollarLow: number | null;
  dollarHigh: number | null;
  dollarMid: number | null;
  steps: ValueStep[];
  formula: string;
}

export interface BookSearchLink {
  id: string;
  stamp: string;
  name: string;
  href: string;
  blurb: string;
}
