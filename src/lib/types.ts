export interface VehicleSpecs {
  vin: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  trim2: string;
  series: string;
  series2: string;
  bodyClass: string;
  vehicleType: string;
  driveType: string;
  transmission: string;
  transmissionSpeeds: string;
  engineDisplacement: string;
  engineModel: string;
  cylinders: string;
  engineConfig: string;
  engineHP: string;
  turbo: string;
  valveTrain: string;
  fuelType: string;
  fuelTypeSecondary: string;
  hybrid: string;
  electrificationLevel: string;
  evDriveUnit: string;
  batteryType: string;
  batteryKWh: string;
  chargerLevel: string;
  manufacturer: string;
  plant: string;
  plantCompany: string;
  doors: string;
  cabType: string;
  gvwr: string;
  gvwrTo: string;
  seatBelts: string;
  restraintInfo: string;
  airbags: string;
  tpms: string;
  abs: string;
  esc: string;
  tractionControl: string;
  entertainment: string;
  trailerType: string;
  trailerBody: string;
  trailerLength: string;
  brakeSystem: string;
  fuelInjection: string;
  engineManufacturer: string;
  otherEngineInfo: string;
  steering: string;
  errorText: string;
  plate: string;
  plateState: string;
  mileage: string;
  concern: string;
  identifiedBy: "vin" | "ymm" | "photo";
  /** Leftover non-empty DecodeVinValues keys we did not promote. */
  vpicExtra: Record<string, string>;
}

export interface RecallRecord {
  campaignNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  reportReceivedDate: string;
}

export interface FluidSpecSheet {
  oilViscosity: string;
  oilSpec: string;
  oilCapacityQt: string;
  coolant: string;
  transmissionFluid: string;
  brakeFluid: string;
  tirePsiFront: string;
  tirePsiRear: string;
  oilFilterSku: string;
  airFilterSku: string;
  cabinFilterSku: string;
  sparkPlugGap: string;
  source: "catalog" | "heuristic" | "model";
  caveats: string[];
}

export interface IdentifiedVehicle {
  specs: VehicleSpecs;
  fluids: FluidSpecSheet;
  recalls: RecallRecord[];
}

export interface FlaggedQuoteItem {
  item: string;
  quotedPrice: number | null;
  fairPriceRange: string;
  warning: string;
  category: "markup" | "upsell" | "labor" | "ok";
}

export interface QuoteAnalysisResult {
  isQuoteFair: boolean;
  shopName: string | null;
  laborRateEstimate: string | null;
  totalQuoted: number | null;
  flaggedItems: FlaggedQuoteItem[];
  mechanicScript: string[];
  summary: string;
  usedVisionModel: boolean;
}

export type SymptomNoise =
  | "squeal"
  | "grinding"
  | "thumping"
  | "clicking"
  | "rumble"
  | "hiss"
  | "none";

export type SymptomWhen =
  | "braking"
  | "turning"
  | "accelerating"
  | "idling"
  | "highway"
  | "cold-start"
  | "always";

export interface SymptomFinding {
  title: string;
  likelihood: "likely" | "possible" | "check";
  plainEnglish: string;
  askTheShop: string;
  diySafe: boolean;
}

export type DtcSeverity = "urgent" | "soon" | "monitor" | "info";

export interface DtcEntry {
  code: string;
  title: string;
  plainEnglish: string;
  typicalCause: string;
  askTheShop: string;
  costBand: string;
  severity: DtcSeverity;
  diySafe: boolean;
}

export interface PartBuyRow {
  name: string;
  sku: string;
  note: string;
  shopBand: string;
  diyBand: string;
  query: string;
}

export interface BuildComponent {
  id: string;
  role: "chassis" | "engine" | "transmission" | "axle" | "ecu" | "other";
  label: string;
  year: string;
  make: string;
  model: string;
  sourceVin: string;
  notes: string;
}

export interface BuildLogItem {
  id: string;
  at: string;
  text: string;
}

export interface BuildProject {
  id: string;
  name: string;
  updatedAt: string;
  components: BuildComponent[];
  log: BuildLogItem[];
}

export interface MechanicTalkingPoint {
  title: string;
  sayThis: string;
}
