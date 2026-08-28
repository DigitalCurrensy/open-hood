export const PLACE_TYPES = [
  "dealers",
  "parts",
  "repair",
  "body",
  "tires",
  "towing",
  "inspection",
  "carwash",
  "fuel",
] as const;

export type PlaceType = (typeof PLACE_TYPES)[number];

export type PlaceSource = "osm" | "demo" | "google_places" | "yelp" | "chain";

export interface DirectoryPlace {
  id: string;
  name: string;
  type: PlaceType;
  address: string;
  phone: string;
  website: string;
  hours: string;
  lat: number;
  lon: number;
  source: PlaceSource;
  miles?: number;
}

export interface GeocodeHit {
  label: string;
  lat: number;
  lon: number;
  query: string;
}

export interface PaidHookStatus {
  id: string;
  name: string;
  env: string;
  configured: boolean;
  wired: boolean | "stub";
}

export interface DirectorySearchResult {
  query: string;
  geocode: GeocodeHit | null;
  places: DirectoryPlace[];
  source: "osm" | "demo" | "mixed";
  timedOut: boolean;
  /** ISO time this result set was assembled (live fetch or cache hit). */
  updatedAt: string;
  message: string;
  attribution: string;
  paidHooks: PaidHookStatus[];
}

export interface EpaMpgRow {
  id: string;
  label: string;
  year: string;
  make: string;
  model: string;
  cityMpg: number | null;
  highwayMpg: number | null;
  combinedMpg: number | null;
  fuel: string;
}

export interface NhtsaComplaintSummary {
  count: number;
  crash: number;
  fire: number;
  injured: number;
  deaths: number;
  topComponents: string[];
}

export interface NhtsaRatingRow {
  vehicleId: string;
  description: string;
  overall: string;
  front: string;
  side: string;
  rollover: string;
}

export interface NhtsaRecallSummary {
  count: number;
  campaigns: string[];
}

export interface PartSearchLinks {
  query: string;
  rockauto: string;
  autozone: string;
  oreilly: string;
  napa: string;
  amazon: string;
  ebayMotors: string;
}
